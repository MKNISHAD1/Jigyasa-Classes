<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Traits\HasTranslations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;


class LessonController extends Controller
{
    use HasTranslations;

    /**
     * List all lessons for a course
     */
    public function lessonList($courseId)
    {
        $course = Course::with('lessons.media')->findOrFail($courseId);

        return response()->json([
            'status' => true,
            'lessons' => $course->lessons->map(fn ($lesson) => $this->formatLesson($lesson)),
        ]);
    }

    /**
     * Show a single lesson
     */
    public function viewLesson($courseId, $id)
    {
        $lesson = Lesson::with('media')->where('course_id', $courseId)->findOrFail($id);

        return response()->json([
            'status' => true,
            'lesson' => $this->formatLesson($lesson),
        ]);
    }

    /**
    * Incremet the view count
    */
    public function incrementView(Lesson $lesson) 
    {
        $lesson->increment('view_count');
    }
    
    /**
     * Generate direct client upload URL + headers for Bunny (client will PUT bytes).
     * Returns upload_url and required headers (AccessKey). WORKING WITH ACCESSKEY IN HEADER
     */
    public function generateSignedUploadUrl(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        // Optional MIME type check
        $request->validate([
            'mime' => 'required|string|in:video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm',
        ]);

        // Build exact upload path
        $relativePath = "/{$lesson->bunny_storage_path}/{$lesson->storage_object_name}";

        $storageZone = env('BUNNY_STORAGE_ZONE');
        $regionHost  = env('BUNNY_REGION', 'sg.storage.bunnycdn.com');
        $storageKey  = env('BUNNY_API_KEY'); // ✅ storage key for uploads
        $expiryTime  = time() + 600; // 10 minutes

        // ✅ Hash only the object path (NO storage zone name)
        $hashableBase = $storageKey . $relativePath . $expiryTime;

        // MD5 → Base64 → URL-safe
        $token = md5($hashableBase, true);
        $token = base64_encode($token);
        $token = strtr($token, '+/', '-_');
        $token = str_replace('=', '', $token);

        // ✅ Correct upload URL format
        $signedUrl = "https://{$regionHost}/{$storageZone}{$relativePath}?token={$token}&expires={$expiryTime}";

        return response()->json([
            'upload_url' => $signedUrl,
            'expires_at' => $expiryTime,
        ]);
    }


    public function proxyUpload(Request $request, $lessonId)
    {
        $lesson = Lesson::with('course')->findOrFail($lessonId);

        $storageZone = env('BUNNY_STORAGE_ZONE');
        $regionHost  = env('BUNNY_REGION', 'sg.storage.bunnycdn.com');
        $accessKey   = env('BUNNY_API_KEY');
        $pullZone    = rtrim(env('BUNNY_PULLZONE_URL'), '/');

        // Build folder name (course slug) and file name (lesson slug)
        $courseNameSlug  = Str::slug($lesson->course->title ?? 'course-'.$lesson->course_id);
        $lessonTitleSlug = Str::slug($lesson->title ?? 'lesson-'.$lesson->id);

        $originalName = $request->header('X-File-Name', 'upload.mp4');
        $extension    = pathinfo($originalName, PATHINFO_EXTENSION) ?: 'mp4';
 
        $folderPath  = $courseNameSlug;
        $fileName    = "{$lessonTitleSlug}.{$extension}";

        $lesson->bunny_storage_path = $folderPath;
        $lesson->storage_object_name = $fileName;

        // Bunny full path for uploading (this one CAN include both)
        $fullPath = "{$folderPath}/{$fileName}";


        // Build upload URL
        $uploadUrl = "https://{$regionHost}/{$storageZone}/{$fullPath}";

        // Stream upload to Bunny
        $ch = curl_init($uploadUrl);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST    => "PUT",
            CURLOPT_RETURNTRANSFER   => true,
            CURLOPT_HTTPHEADER       => [
                "AccessKey: {$accessKey}",
                "Content-Type: " . $request->header('X-File-Type', 'application/octet-stream'),
            ],
            CURLOPT_UPLOAD           => true,
            CURLOPT_INFILESIZE        => (int) $request->header('Content-Length', 0),
            CURLOPT_TIMEOUT           => 0,
            CURLOPT_CONNECTTIMEOUT    => 0,
        ]);

        $inputStream = fopen('php://input', 'rb');
        $callback = function ($ch, $fd, $length) use ($inputStream) {
            return fread($inputStream, $length);
        };
        curl_setopt($ch, CURLOPT_READFUNCTION, $callback);

        $response = curl_exec($ch);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        fclose($inputStream);
        curl_close($ch);

        if ($status === 201 || $status === 200) {
            $lesson->update([
                'bunny_storage_path' => $folderPath,
                'storage_object_name' => $fileName,
                'bunny_video_url'   => "{$pullZone}/{$fullPath}",
                'status'            => 'uploaded',
            ]);


            return response()->json([
                'message'        => 'Uploaded successfully',
                'bunny_video_url'=> $lesson->bunny_video_url,
            ]);
        }

        return response()->json([
            'message'         => 'Upload failed',
            'status'          => $status,
            'bunny_response'  => $response,
        ], $status ?: 500);
    }



    /**
     * Create a new lesson
     */
    public function createLesson(Request $request, $courseId)
    {
        $user = Auth::user();

        if (!$user->hasAnyRole(['teacher', 'moderator', 'admin', 'super_admin'])) {
            return response()->json([
                'status' => false, 
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'title_en'       => 'required|string|max:255',
            'title_hi'       => 'nullable|string|max:255',
            'is_free_preview' => 'boolean',
            'description_en'     => 'nullable|string',
            'description_hi'     => 'nullable|string',
            'status'          => 'nullable|in:draft,published,archived',
            'published_at'    => 'nullable|date',
            'materials.*' =>  'nullable|file|mimes:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,zip,rar,7z|max:40960',

        ]);
        
        // auto-assign order
        $lastOrder = Lesson::where('course_id', $courseId)->max('order') ?? 0;
        $order = $request->order ?? ($lastOrder + 1);

        // Create lesson (store base English version)
        $lesson = Lesson::create([
            'course_id'      => $courseId,
            'title'          => $request->title_en,
            'order'          => $order,
            'is_free_preview'=> $request->is_free_preview ?? false,
            'uploaded_by'     => $user->id,
            'description'     => $request->description_en ?? null,
            'status'          => $request->status ?? 'draft',
            'published_at'    => $request->published_at ?? null,

        ]);

        // Only save human translation if user typed something
        $lesson->saveTranslation('title', 'hi', $request->title_hi);
        $lesson->saveTranslation('description', 'hi', $request->description_hi);


        // Auto-generate Hindi translations for empty
        if (!$request->title_hi || !$request->description_hi) {
            $lesson->translateFields(['title', 'description'], 'hi');
        }



        return response()->json([
            'status' => true,
            'message' => 'Lesson created successfully',
            'lesson' => $this->formatLesson($lesson->load(['media','translations'])),
        ], 201);
    }

    /**
     * Upload study materials for an existing lesson
     */
    public function uploadMaterials(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);
        $user   = Auth::user();

        if (!$user->hasAnyRole(['teacher', 'moderator', 'admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'materials.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,zip,rar,7z|max:40960',
        ]);

        if (!$request->hasFile('materials')) {
            return response()->json([
                'status' => false,
                'message' => 'No materials provided'
            ], 422);
        }

        $files = $request->file('materials');
        $files = is_array($files) ? $files : [$files];

        foreach ($files as $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $lessonTitleSlug = Str::slug($lesson->title ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
                $extension = $file->getClientOriginalExtension();
                $fileName = $lessonTitleSlug . '-' . time() . '.' . $extension;

                $path = $file->storeAs('uploads/lessons', $fileName, 'public');

                Media::create([
                    'url'            => $path,
                    'original_name'  => $file->getClientOriginalName(),
                    'type'           => 'lesson_resource',
                    'owner_id'       => $lesson->id,
                    'owner_type'     => Lesson::class,
                ]);
            }
        }

        return response()->json([
            'status'  => true,
            'message' => 'Materials uploaded successfully',
            'lesson'  => $this->formatLesson($lesson->load('media','translations'))
        ], 201);
    }


    /**
     * Called after the client successfully uploaded the file to Bunny.
     * Validates lesson and marks it uploaded.
     */
    public function finalizeUpload(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        // optional: validate user has access / owns lesson
        $pullZone = rtrim(env('BUNNY_PULLZONE_URL'), '/');
        $path = trim($lesson->bunny_storage_path, '/');
        $filename = $lesson->storage_object_name;

        if (!$filename) {
            return response()->json(['status' => false, 'message' => 'File name not set.'], 422);
        }

        $lesson->update([
            'bunny_video_url' => "{$pullZone}/{$path}/{$filename}",
            'status' => 'uploaded'
        ]);

        return response()->json(['status' => true, 'message' => 'Upload finalized', 'bunny_video_url' => $lesson->bunny_video_url]);
    }

    /**
     * Update a lesson
     */
    public function updateLesson(Request $request, $courseId, $id)
    {
            $course = Course::findOrFail($courseId);
            $lesson = Lesson::with('translations')->where('course_id', $courseId)->findOrFail($id);

            $user = Auth::user();

            // ✅ FIX: allow either creator OR assigned teacher
            $isOwnerOrAssignedTeacher = (
                $user->id === $course->created_by ||
                $user->id === $course->teacher_id
            );


            if (!$isOwnerOrAssignedTeacher && !$user->hasAnyRole(['admin', 'super_admin'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized to edit this course',
                ], 403);
            }


            $validated = $request->validate([
                'title_en'         => 'sometimes|string|max:255',
                'title_hi'         => 'nullable|string|max:255',
                'description_en'   => 'sometimes|string',
                'description_hi'   => 'nullable|string',
                'is_free_preview' => 'boolean',
                'status'          => 'nullable|in:draft,published,archived',
                'published_at'    => 'nullable|date',
                'materials.*' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,gif,svg,webp,zip,rar,xlsx,csv|max:25600',
                'removed_materials' => 'nullable|array',

            ]);

                        
            // ------------------- OLD VALUES -----------------------
            $oldTitleEn = $lesson->title;
            $oldDescEn  = $lesson->description;

            $hiTrans = $lesson->translations()->where('locale', 'hi')->first();
            $oldTitleHi = $hiTrans->title ?? null;
            $oldDescHi  = $hiTrans->description ?? null;

            // ------------------- NEW VALUES -----------------------
            $newTitleEn = $request->title_en;
            $newDescEn  = $request->description_en;

            $newTitleHi = $request->title_hi;
            $newDescHi  = $request->description_hi;


            // ------------------- DETECT CHANGES -------------------
            $titleEnChanged = $request->has('title_en') && $newTitleEn !== $oldTitleEn;
            $descEnChanged  = $request->has('description_en') && $newDescEn !== $oldDescEn;

            $titleHiManualChanged = (
                $request->has('title_hi') &&
                $newTitleHi !== null &&
                $newTitleHi !== '' &&
                $newTitleHi !== $oldTitleHi
            );

            $descHiManualChanged = (
                    $request->has('description_hi') &&
                    $newDescHi !== null &&
                    $newDescHi !== '' &&
                    $newDescHi !== $oldDescHi
                );

            // ------------------- SAVE MANUAL HI -------------------
            if ($titleHiManualChanged) {
                $lesson->saveTranslation('title', 'hi', $newTitleHi);
            }

            if ($descHiManualChanged) {
                $lesson->saveTranslation('description', 'hi', $newDescHi);
            }

            // ------------------- UPDATE ENGLISH -------------------
            $lesson->update([
                'title'          => $newTitleEn ?? $lesson->title,
                'description'    => $newDescEn ?? $lesson->description,
                'is_free_preview' => $request->is_free_preview ?? $lesson->is_free_preview,
                'status'         => $request->status ?? $lesson->status,
                'published_at'   => $request->status === 'published' ? now() : $lesson->published_at,
            ]);

            // ------------------- AUTO TRANSLATION -------------------
            $fieldsToTranslate = [];

            if ($titleEnChanged && !$titleHiManualChanged) {
                $fieldsToTranslate[] = 'title';
            }

            if ($descEnChanged && !$descHiManualChanged) {
                $fieldsToTranslate[] = 'description';
            }

            if (!empty($fieldsToTranslate)) {

                // get or create Hindi translation row
                $translationHi = $lesson->translations()
                    ->firstOrCreate(['locale' => 'hi']);

                // clear only the fields that require auto-translation
                foreach ($fieldsToTranslate as $field) {
                    $translationHi->$field = null; // remove old Hindi
                }

                $translationHi->save();

                // now auto translate only those fields
                $lesson->translateFields($fieldsToTranslate, 'hi');
            }

            // --------- Remove materials if requested
            if ($request->has('removed_materials')) {
                $materialIds = $request->input('removed_materials');
                $medias = Media::whereIn('id', $materialIds)->get();
                foreach ($medias as $media) {
                    if (\Storage::disk('public')->exists($media->url)) {
                        \Storage::disk('public')->delete($media->url);
                    }
                    $media->forceDelete();
                }
            }

            // ✅ Upload new materials
            if ($request->hasFile('materials')) {
                $files = $request->file('materials');

                if ($files instanceof UploadedFile) {
                    $files = [$files];
                }

                if (is_array($files)) {
                    foreach ($files as $file) {
                        if ($file instanceof UploadedFile) {
                            $path = $file->store('uploads/lessons', 'public');
                            Media::create([
                                'url'        => $path,
                                'type'       => 'lesson_resource',
                                'owner_id'   => $lesson->id,
                                'owner_type' => Lesson::class,
                                'original_name' => $file->getClientOriginalName(),
                            ]);
                        }
                    }
                }
            }



            return response()->json([
                'status' => true,
                'message' => 'Lesson updated successfully',
                'lesson' => $this->formatLesson($lesson->load(['media','translations'])),
            ]);
    }

    /**
     * Change lesson order by drag and drop 
     */
    public function reorderLessons(Request $request, $courseId)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:lessons,id',
            'orders.*.order' => 'required|integer|min:1',
        ]);

        foreach ($validated['orders'] as $item) {
            Lesson::where('id', $item['id'])
                ->where('course_id', $courseId)
                ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Lessons reordered successfully']);
    }

    /**
     * Delete Single lesson
     */
    public function deleteLesson($courseId, $id)
    {
        $lesson = Lesson::where('course_id', $courseId)->findOrFail($id);
        $actor = Auth::user();

        // ✅ Only owner (uploader), course creator, admin, or super_admin
        if ($lesson->uploaded_by !== $actor->id 
            && $lesson->course->created_by !== $actor->id 
            && !$actor->hasAnyRole(['admin', 'super_admin','teacher'])) {
            return response()->json([
                'status' => false,
                'message' => 'You are not allowed to delete this lesson.'
            ], 403);
        }
        
        $lesson->delete(); // sof delete

        // Fetch course to check status
        $course = $lesson->course;

        // Only reorder if the course is already published
        if ($course && $course->status === 'published') {
            $this->normalizeLessonOrder($courseId);
        }


        return response()->json([
            'status' => true,
            'message' => 'Lesson deleted successfully'
        ]);
    }


     /**
     * Delete Multiple lesson
     */
    public function bulkDeleteLessons(Request $request, $courseId)
    {
        $actor = Auth::user();

        $validated = $request->validate([
            'lesson_ids'   => 'required|array|min:1',
            'lesson_ids.*' => 'integer|exists:lessons,id',
        ]);

        $lessons = Lesson::where('course_id', $courseId)
            ->whereIn('id', $validated['lesson_ids'])
            ->get();

        if ($lessons->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No valid lessons found for deletion.'
            ], 404);
        }

        foreach ($lessons as $lesson) {
            // ✅ Only owner (uploader), course creator, admin, or super_admin
            if (
                $lesson->uploaded_by !== $actor->id &&
                $lesson->course->created_by !== $actor->id &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ) {
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to delete lesson: {$lesson->title}"
                ], 403);
            }


            $lesson->delete();
        }
        
        // ✅ Normalize order after bulk delete
        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Selected lessons deleted successfully'
        ]);
    }


    /**
     * Restore multiple soft-deleted lessons
     */
    public function bulkRestoreLessons(Request $request, $courseId)
    {
        $actor = Auth::user();

        $validated = $request->validate([
            'lesson_ids'   => 'required|array|min:1',
            'lesson_ids.*' => 'integer|exists:lessons,id',
        ]);

        $lessons = Lesson::withTrashed()
            ->where('course_id', $courseId)
            ->whereIn('id', $validated['lesson_ids'])
            ->onlyTrashed()
            ->get();

        if ($lessons->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No lessons found for restore.'
            ], 404);
        }

        foreach ($lessons as $lesson) {
            // ✅ Same permission rules as delete
            if (
                $lesson->uploaded_by !== $actor->id &&
                $lesson->course->created_by !== $actor->id &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ) {
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to restore lesson: {$lesson->title}"
                ], 403);
            }

            // Ensure restored lesson order doesn't collide
            $maxOrder = Lesson::where('course_id', $courseId)
                ->whereNull('deleted_at')
                ->max('order') ?? 0;

            $orderExists = Lesson::where('course_id', $courseId)
                ->where('order', $lesson->order)
                ->whereNull('deleted_at')
                ->exists();

            if ($orderExists) {
                $lesson->order = $maxOrder + 1;
            }


            $lesson->restore();
        }
        // ✅ Normalize order after bulk delete
        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Selected lessons restored successfully'
        ]);
    }
    
    /**
     * Permanently delete multiple lessons (force delete)
     */
    public function bulkForceDeleteLessons(Request $request, $courseId)
    {
        $actor = Auth::user();

        $validated = $request->validate([
            'lesson_ids'   => 'required|array|min:1',
            'lesson_ids.*' => 'integer|exists:lessons,id',
        ]);

        $lessons = Lesson::withTrashed()
            ->where('course_id', $courseId)
            ->whereIn('id', $validated['lesson_ids'])
            ->get();

        if ($lessons->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No lessons found for permanent deletion.'
            ], 404);
        }

        foreach ($lessons as $lesson) {
            // Permission check
            if (
                $lesson->uploaded_by !== $actor->id &&
                $lesson->course->created_by !== $actor->id &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ) {
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to permanently delete lesson: {$lesson->title}"
                ], 403);
            }

            $lesson->forceDelete();
        }

        // ✅ Normalize order after bulk force delete
        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Selected lessons permanently deleted and order normalized'
        ]);
    }

    /**
     * List all soft-deleted lessons for a course
     */
    public function trashedLessons($courseId)
    {
        $actor = Auth::user();

        $course = Course::findOrFail($courseId);

        // ✅ Only course creator, admin, or super_admin can see trashed
        if ($course->created_by !== $actor->id && !$actor->hasAnyRole(['admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'You are not allowed to view trashed lessons for this course.'
            ], 403);
        }

        $trashed = Lesson::onlyTrashed()
            ->where('course_id', $courseId)
            ->with('media')
            ->get();

        return response()->json([
            'status' => true,
            'lessons' => $trashed->map(fn($lesson) => $this->formatLesson($lesson)),
        ]);
    }

    /**
     * List all soft-deleted lessons by user only (Self deletation cann be view  only )
     */
    public function trashedLessonsByUser(Request $request, $courseId)
    {
        $user = $request->user();

        $course = Course::findOrFail($courseId);

        $lessons = Lesson::onlyTrashed()
            ->where('course_id', $courseId)
            ->where('uploaded_by', auth()->id()) // Only lessons created by that teacher
            ->orderBy('deleted_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'lessons' => $lessons,
        ]);
    }


    /**
     * Force delete (from trash)
     */
    public function forceDeleteLesson($courseId, $id)
    {
        $lesson = Lesson::withTrashed()
            ->where('course_id', $courseId)
            ->findOrFail($id);

        // ✅ Cleanup all attached files
        if ($lesson->media) {
            foreach ($lesson->media as $media) {
                if ($media->url) {
                    Storage::disk('public')->delete($media->url);
                }
                $media->delete();
            }
        }
        $lesson->forceDelete();

        // Reorder lessons after permanent deletion
        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Lesson permanently deleted and order normalized.'
        ]);
    }

    /**
     * Force delete lesson by user only (from trash)
     */
    public function forceDeleteLessonByUser(Request $request, $courseId, $id)
    {
        $user = $request->user();

        $course = Course::findOrFail($courseId);

        $lesson = Lesson::onlyTrashed()
            ->where('course_id', $courseId)
            ->where('uploaded_by', auth()->id()) // Only lessons created by that teacher
            ->orderBy('deleted_at', 'desc')
            ->firstOrFail();

        if (!$lesson) {
            return response()->json(['status' => false, 'message' => 'Lesson not found or not authorized.']);
        }

                // ✅ Cleanup all attached files
        if ($lesson->media) {
            foreach ($lesson->media as $media) {
                if ($media->url) {
                    Storage::disk('public')->delete($media->url);
                }
                $media->delete();
            }
        }
        $lesson->forceDelete();
        return response()->json(['status' => true, 'message' => 'Lesson permanently deleted.']);
    }

    /**
     * Restore a soft deleted lesson
     */
    public function restoreLesson($courseId, $id)
    {
        $lesson = Lesson::withTrashed()
            ->where('course_id', $courseId)
            ->findOrFail($id);
        
        // Determine current max order
        $maxOrder = Lesson::where('course_id', $courseId)
            ->whereNull('deleted_at')
            ->max('order') ?? 0;

        // If another active lesson already has same order → push it to end
        $orderExists = Lesson::where('course_id', $courseId)
            ->where('order', $lesson->order)
            ->whereNull('deleted_at')
            ->exists();

        if ($orderExists) {
            $lesson->order = $maxOrder + 1;
        }

        $lesson->restore();

        // normalize order if restoring into published course
        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Lesson restored successfully and order normalized.'
        ]);
    }

    /**
     * Only Restore a soft deleted lesson y use itself
     */
    public function restoreLessonByUser(Request $request, $courseId, $id)
    {
        $user = $request->user();

        $course = Course::findOrFail($courseId);

        $lesson = Lesson::onlyTrashed()
            ->where('course_id', $courseId)
            ->where('uploaded_by', auth()->id()) // Only lessons created by that teacher
            ->orderBy('deleted_at', 'desc')
            ->firstOrFail();
        
        $maxOrder = Lesson::where('course_id', $courseId)
            ->whereNull('deleted_at')
            ->max('order') ?? 0;

        $orderExists = Lesson::where('course_id', $courseId)
            ->where('order', $lesson->order)
            ->whereNull('deleted_at')
            ->exists();

        if ($orderExists) {
            $lesson->order = $maxOrder + 1;
        }


        if (!$lesson) {
            return response()->json(['status' => false, 'message' => 'Lesson not found or not authorized.']);
        }

        $lesson->restore();

        $this->normalizeLessonOrder($courseId);

        return response()->json([
            'status' => true,
            'message' => 'Lesson restored successfully and order normalized.'
        ]);
    }



    /**
     * Normalize order (1, 2, 3, ...) for active lessons
     */
    protected function normalizeLessonOrder($courseId)
    {
        $lessons = Lesson::where('course_id', $courseId)
            ->whereNull('deleted_at')
            ->orderBy('order')
            ->get(['id', 'order']);

        foreach ($lessons as $index => $lesson) {
            $newOrder = $index + 1;
            if ($lesson->order != $newOrder) {
                $lesson->updateQuietly(['order' => $newOrder]);
            }
        }

    }

    /**
     * erify and regenarate signed url for 10 min only
     */

    public function refreshSignedUrl($id)
    {
        $lesson = Lesson::findOrFail($id);

        // Important: ensure the current user can access the course/lesson
        if (! auth()->user() || ! method_exists(auth()->user(), 'canAccessLesson') || ! auth()->user()->canAccessLesson($lesson)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'url' => $lesson->signed_url,
            'bunny_video_url' => $lesson->bunny_video_url,
            'expires_in' => env('BUNNY_TOKEN_EXPIRY', 600),
        ]);
    }



    /**
     * Helper: Format lesson with absolute media URLs
     */
    private function formatLesson(Lesson $lesson)
    {
        
                return [
                    'id'       => $lesson->id,

                    'title'    => [
                        'en' => $lesson->title,
                        'hi' => $lesson->translateField('title','hi') ?? $lesson->title,
                    ],
                    
                    'description' => [
                        'en' => $lesson->description,
                        'hi' => $lesson->translateField('description','hi') ?? $lesson->description,
                    ],

                    'bunny_video_url' => $lesson->bunny_video_url,
                    'bunny_signed_url' => $lesson->signed_url,

                    'order'    => $lesson->order,
                    'is_free_preview' => $lesson->is_free_preview,
                    'status'          => $lesson->status,
                    'is_locked'       => $lesson->is_locked,
                    'published_at'    => $lesson->published_at,

                    // Map lesson media files as materials
                    'materials'       => $lesson->media->map(fn ($file) => [
                        'id'   => $file->id,
                        'url'  => asset('storage/' . $file->url),
                        'name' => $file->original_name ?? basename($file->url),
                    ]),
                ];
    }

}
