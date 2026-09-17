<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\CourseModule;
use App\Models\LessonUpload;

use App\Jobs\ProcessLessonHls;
use App\Services\BunnyStorageService;

use Illuminate\Http\Request;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Traits\HasTranslations;


class LessonController extends Controller
{
    use HasTranslations;

    /**
     * List all lessons for a course
     */
    public function lessonList($courseId)
    {
        $course = Course::with('lessons.media','lessons.module')->findOrFail($courseId);

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
        $lesson = Lesson::with('media','module')->where('course_id', $courseId)->findOrFail($id);

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
    // public function generateSignedUploadUrl(Request $request, $lessonId)
    // {
    //     $lesson = Lesson::findOrFail($lessonId);

    //     // Optional MIME type check
    //     $request->validate([
    //         'mime' => 'required|string|in:video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm',
    //     ]);

    //     // Build exact upload path
    //     $relativePath = "/{$lesson->bunny_storage_path}/{$lesson->storage_object_name}";

    //     $storageZone = env('BUNNY_STORAGE_ZONE');
    //     $regionHost  = env('BUNNY_REGION', 'de.storage.bunnycdn.com');
    //     $storageKey  = env('BUNNY_API_KEY'); // ✅ storage key for uploads
    //     $expiryTime  = time() + 600; // 10 minutes

    //     // ✅ Hash only the object path (NO storage zone name)
    //     $hashableBase = $storageKey . $relativePath . $expiryTime;

    //     // MD5 → Base64 → URL-safe
    //     $token = md5($hashableBase, true);
    //     $token = base64_encode($token);
    //     $token = strtr($token, '+/', '-_');
    //     $token = str_replace('=', '', $token);

    //     // ✅ Correct upload URL format
    //     $signedUrl = "https://{$regionHost}/{$storageZone}{$relativePath}?token={$token}&expires={$expiryTime}";

    //     return response()->json([
    //         'upload_url' => $signedUrl,
    //         'expires_at' => $expiryTime,
    //     ]);
    // }

    public function generateBunnySignedUrl($path)
    {
        $pullZoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');
        $securityKey = env('BUNNY_SIGNING_KEY');

        // TEST: 180 seconds
        $expires = time() + env('BUNNY_TOKEN_EXPIRY', 180);

        /*
        * Accept either:
        * /hsl-test-folder/playlist.m3u8
        *
        * OR:
        * https://mk-stream-zone-1.b-cdn.net/hsl-test-folder/playlist.m3u8
        */
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            $path = parse_url($path, PHP_URL_PATH);
        }

        $path = '/' . ltrim($path, '/');

        /*
        * Directory containing playlist + .ts/.m4s segments
        *
        * Example:
        * /hsl-test-folder/
        */
        $tokenPath = rtrim(dirname($path), '/') . '/';

        /*
        * Bunny token_path must be included in the hash.
        */
        $parameterData = 'token_path=' . $tokenPath;

        $hashableBase =
            $securityKey .
            $tokenPath .
            $expires .
            $parameterData;

        $token = base64_encode(
            hash('sha256', $hashableBase, true)
        );

        // Bunny-safe Base64
        $token = strtr($token, '+/', '-_');
        $token = rtrim($token, '=');

        /*
        * PATH-BASED TOKEN
        *
        * This is important for HLS because Bunny allows
        * subsequent files in the directory to use the token.
        */
        return $pullZoneUrl .
            '/bcdn_token=' . $token .
            '&expires=' . $expires .
            '&token_path=' . rawurlencode($tokenPath) .
            $path;
    }

    /**
     * Proxy lesson video upload to Bunny.
     *
     * React generates the upload UUID before starting the upload.
     * Laravel creates a temporary LessonUpload record using that UUID,
     * then streams the request body directly to Bunny.
     */
    public function proxyUpload(Request $request)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Get upload UUID
        |--------------------------------------------------------------------------
        */

        $uploadUuid = $request->header('X-Upload-UUID');

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid upload UUID.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Find upload session
        |--------------------------------------------------------------------------
        */

        $upload = LessonUpload::where(
            'upload_uuid',
            $uploadUuid
        )->first();

        if (!$upload) {
            return response()->json([
                'status' => false,
                'message' => 'Upload session not found.'
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Ownership
        |--------------------------------------------------------------------------
        */

        if ((int) $upload->user_id !== (int) $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Check upload state
        |--------------------------------------------------------------------------
        */

        if (
            $upload->status === 'cancelling' ||
            $upload->status === 'cancelled'
        ) {
            return response()->json([
                'status' => false,
                'message' => 'Upload was cancelled.'
            ], 409);
        }

        if ($upload->status !== 'uploading') {
            return response()->json([
                'status' => false,
                'message' => 'Upload session is not ready.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Validate incoming file size
        |--------------------------------------------------------------------------
        |
        | Maximum lesson source video:
        | 5 GB
        |
        */

        $contentLength = (int) $request->header(
            'Content-Length',
            0
        );

        $maxSize = 5 * 1024 * 1024 * 1024; // 5 GB

        if ($contentLength <= 0) {
            return response()->json([
                'status' => false,
                'message' => 'Content-Length is required.'
            ], 411);
        }

        if ($contentLength > $maxSize) {

            return response()->json([
                'status' => false,
                'message' => 'Video exceeds the maximum allowed size of 5 GB.'
            ], 413);
        }


        /*
        |--------------------------------------------------------------------------
        | Create temporary processing directory
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | storage/app/lesson-processing/{upload_uuid}/
        |
        */

        $directory =
            storage_path(
                'app/lesson-processing/' .
                $upload->upload_uuid
            );


        if (!is_dir($directory)) {

            if (!mkdir($directory, 0755, true)) {

                \Log::error(
                    'Failed to create lesson processing directory.',
                    [
                        'upload_uuid' => $upload->upload_uuid,
                        'directory' => $directory,
                    ]
                );

                return response()->json([
                    'status' => false,
                    'message' =>
                        'Unable to create processing directory.'
                ], 500);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Temporary source video path
        |--------------------------------------------------------------------------
        */

        $extension = pathinfo(
            $upload->original_filename,
            PATHINFO_EXTENSION
        );

        $extension = $extension
            ? strtolower($extension)
            : 'mp4';


        $filename =
            'source.' . $extension;


        $filePath =
            $directory . '/' . $filename;


        /*
        |--------------------------------------------------------------------------
        | Stream Browser → Laravel disk
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | We are NOT loading the entire video into PHP memory.
        |
        */

        $inputStream = fopen(
            'php://input',
            'rb'
        );

        if (!$inputStream) {

            return response()->json([
                'status' => false,
                'message' =>
                    'Unable to read uploaded video.'
            ], 500);
        }


        $outputStream = fopen(
            $filePath,
            'wb'
        );

        if (!$outputStream) {

            fclose($inputStream);

            return response()->json([
                'status' => false,
                'message' =>
                    'Unable to create temporary video file.'
            ], 500);
        }


        /*
        |--------------------------------------------------------------------------
        | Stream file
        |--------------------------------------------------------------------------
        */

        $bytesWritten = 0;

        while (!feof($inputStream)) {

            $chunk = fread(
                $inputStream,
                1024 * 1024 // 1 MB
            );

            if ($chunk === false) {
                break;
            }

            if ($chunk === '') {
                continue;
            }

            $written = fwrite(
                $outputStream,
                $chunk
            );

            if ($written === false) {
                fclose($inputStream);
                fclose($outputStream);

                @unlink($filePath);

                return response()->json([
                    'status' => false,
                    'message' =>
                        'Failed while saving uploaded video.'
                ], 500);
            }

            $bytesWritten += $written;
        }


        fclose($inputStream);
        fclose($outputStream);


        /*
        |--------------------------------------------------------------------------
        | Verify uploaded size
        |--------------------------------------------------------------------------
        */

        $actualSize = filesize($filePath);

        if (
            $actualSize === false ||
            $actualSize <= 0
        ) {

            @unlink($filePath);

            $upload->update([
                'status' => 'failed',
            ]);

            return response()->json([
                'status' => false,
                'message' =>
                    'Uploaded video is empty or invalid.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Store temporary source path
        |--------------------------------------------------------------------------
        */

        $relativePath =
            'lesson-processing/' .
            $upload->upload_uuid .
            '/' .
            $filename;


        $upload->update([
            'temporary_file_path' => $relativePath,
            'temporary_storage_path' => $upload->temporary_storage_path,
            'temporary_object_name' => $filename,
            'status' => 'uploaded',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Log
        |--------------------------------------------------------------------------
        */

        \Log::info(
            'LESSON SOURCE VIDEO UPLOADED TO PROCESSING SERVER',
            [
                'upload_uuid' =>
                    $upload->upload_uuid,

                'temporary_file_path' =>
                    $relativePath,

                'size' =>
                    $actualSize,

                'hls_storage_path' =>
                    $upload->hls_storage_path,
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'status' => true,

            'message' =>
                'Source video uploaded successfully.',

            'upload_uuid' =>
                $upload->upload_uuid,

            'temporary_file_path' =>
                $relativePath,

            'hls_storage_path' =>
                $upload->hls_storage_path,

        ], 201);
    }

    public function processHls(Request $request, $uploadUuid)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate UUID
        |--------------------------------------------------------------------------
        */

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid upload UUID.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Atomically claim upload for HLS processing
        |--------------------------------------------------------------------------
        |
        | uploaded -> processing
        |
        | Prevents multiple processHls() requests from processing
        | the same upload simultaneously.
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(function () use (
            $uploadUuid,
            $user
        ) {

            $upload = LessonUpload::where(
                'upload_uuid',
                $uploadUuid
            )
            ->lockForUpdate()
            ->first();

            /*
            |--------------------------------------------------------------------------
            | Upload not found
            |--------------------------------------------------------------------------
            */

            if (!$upload) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload session not found.'
                    ], 404),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Ownership
            |--------------------------------------------------------------------------
            */

            if ((int) $upload->user_id !== (int) $user->id) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Unauthorized.'
                    ], 403),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | State validation
            |--------------------------------------------------------------------------
            */

            if (
                $upload->status === 'cancelling' ||
                $upload->status === 'cancelled'
            ) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload was cancelled.'
                    ], 409),
                    'upload' => null,
                ];
            }

            if ($upload->status === 'processing') {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'HLS processing is already in progress.'
                    ], 409),
                    'upload' => null,
                ];
            }

            if ($upload->status === 'processed') {
                return [
                    'response' => response()->json([
                        'status' => true,
                        'message' => 'HLS processing has already completed.',
                        'upload_uuid' => $upload->upload_uuid,
                        'lesson_id' => $upload->lesson_id,
                        'hls_storage_path' => $upload->hls_storage_path,
                        'playlist' =>
                            $upload->hls_storage_path
                                ? "{$upload->hls_storage_path}/playlist.m3u8"
                                : null,
                    ], 200),
                    'upload' => null,
                ];
            }

            if ($upload->status !== 'uploaded') {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload is not ready for HLS processing.'
                    ], 422),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Claim upload
            |--------------------------------------------------------------------------
            */

            $upload->update([
                'status' => 'processing',
            ]);

            return [
                'response' => null,
                'upload' => $upload,
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | Return immediate state responses
        |--------------------------------------------------------------------------
        */

        if ($result['response']) {
            return $result['response'];
        }

        $upload = $result['upload'];

        /*
        |--------------------------------------------------------------------------
        | Dispatch background HLS processing
        |--------------------------------------------------------------------------
        */

        ProcessLessonHls::dispatch(
            $upload->upload_uuid
        );

        return response()->json([
            'status' => true,
            'message' => 'HLS processing has been queued.',
            'upload_uuid' => $upload->upload_uuid,
        ], 202);

    }

    public function uploadStatus(Request $request, $uploadUuid)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate UUID
        |--------------------------------------------------------------------------
        */

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid upload UUID.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Find upload
        |--------------------------------------------------------------------------
        */

        $upload = LessonUpload::where(
            'upload_uuid',
            $uploadUuid
        )->first();

        if (!$upload) {
            return response()->json([
                'status' => false,
                'message' => 'Upload session not found.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Ownership
        |--------------------------------------------------------------------------
        */

        if ((int) $upload->user_id !== (int) $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Build response
        |--------------------------------------------------------------------------
        */

        $processing =
            $upload->status === 'processing';

        $completed =
            $upload->status === 'processed';

        $failed =
            $upload->status === 'failed';

        return response()->json([
            'status' => true,

            'upload_uuid' =>
                $upload->upload_uuid,

            'upload_status' =>
                $upload->status,

            /*
            |--------------------------------------------------------------------------
            | Lesson ID
            |--------------------------------------------------------------------------
            |
            | This becomes available after ProcessLessonHls
            | creates the Lesson.
            |
            */

            'lesson_id' =>
                $upload->lesson_id,

            'processing' =>
                $processing,

            'completed' =>
                $completed,

            'failed' =>
                $failed,

            'message' =>
                match ($upload->status) {

                    'uploading' =>
                        'Video is being uploaded.',

                    'uploaded' =>
                        'Video uploaded. Waiting for processing.',

                    'processing' =>
                        'HLS processing is in progress.',

                    'processed' =>
                        'HLS processing completed successfully.',

                    'failed' =>
                        'HLS processing failed.',

                    'cancelling' =>
                        'Upload cancellation is in progress.',

                    'cancelled' =>
                        'Upload was cancelled.',

                    default =>
                        'Unknown upload state.',
                },

            'hls_storage_path' =>
                $upload->hls_storage_path,

            'playlist' =>
                $completed && $upload->hls_storage_path
                    ? "{$upload->hls_storage_path}/playlist.m3u8"
                    : null,
        ]);
    }
    
    public function startUpload(Request $request)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Read metadata
        |--------------------------------------------------------------------------
        */

        $uploadUuid = $request->input('upload_uuid');
        $courseId = $request->input('course_id');

        $titleEn = $request->input('title_en', '');
        $descriptionEn = $request->input('description_en', '');

        $titleHi = $request->input('title_hi', '');
        $descriptionHi = $request->input('description_hi', '');

        $originalFilename = $request->input(
            'original_filename',
            'upload.mp4'
        );

        $mimeType = $request->input(
            'mime_type',
            'application/octet-stream'
        );

        /*
        |--------------------------------------------------------------------------
        | Validate
        |--------------------------------------------------------------------------
        */

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Valid upload UUID is required.'
            ], 422);
        }

        if (!$courseId) {
            return response()->json([
                'status' => false,
                'message' => 'Course ID is required.'
            ], 422);
        }

        if (!$titleEn) {
            return response()->json([
                'status' => false,
                'message' => 'Lesson title is required.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Find course
        |--------------------------------------------------------------------------
        */

        $course = Course::find($courseId);

        if (!$course) {
            return response()->json([
                'status' => false,
                'message' => 'Course not found.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate UUID
        |--------------------------------------------------------------------------
        */

        if (
            LessonUpload::where(
                'upload_uuid',
                $uploadUuid
            )->exists()
        ) {
            return response()->json([
                'status' => false,
                'message' => 'Upload session already exists.'
            ], 409);
        }

        /*
        |--------------------------------------------------------------------------
        | Create HLS Bunny storage path
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | my-course/
        |     lessons-video/
        |         550e8400-e29b-41d4-a716-446655440000/
        |
        | FFmpeg will eventually generate:
        |
        | playlist.m3u8
        | segment_000.ts
        | segment_001.ts
        | segment_002.ts
        | ...
        |
        */

        $courseNameSlug = Str::slug(
            $course->title ?? 'course-' . $course->id
        );

        $temporaryStoragePath =
            "lesson-processing/{$uploadUuid}";

        $hlsStoragePath =
            "{$courseNameSlug}/lesson-videos/{$uploadUuid}";

        /*
        |--------------------------------------------------------------------------
        | Create upload session
        |--------------------------------------------------------------------------
        */

        $upload = LessonUpload::create([
            'upload_uuid' => $uploadUuid,

            'user_id' => $user->id,

            'course_id' => $course->id,

            'title_en' => $titleEn,

            'description_en' => $descriptionEn,

            'title_hi' => $titleHi,

            'description_hi' => $descriptionHi,

            'original_filename' => $originalFilename,

            'mime_type' => $mimeType,

            'temporary_file_path' => null,

            'hls_storage_path' => $hlsStoragePath,

            'status' => 'uploading',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Log
        |--------------------------------------------------------------------------
        */

        \Log::info(
            'HLS UPLOAD SESSION CREATED',
            [
                'upload_uuid' =>
                    $upload->upload_uuid,

                'user_id' =>
                    $user->id,

                'course_id' =>
                    $course->id,

                'hls_storage_path' =>
                    $upload->hls_storage_path,

                'status' =>
                    $upload->status,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'status' => true,

            'message' =>
                'HLS upload session created.',

            'upload_uuid' =>
                $upload->upload_uuid,

            'hls_storage_path' =>
                $upload->hls_storage_path,

        ], 201);
    }

    /**
     * Create a new lesson
     */
    public function createLesson(Request $request, $courseId)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            // Change  1
            'upload_uuid' => 'required|uuid',

            'title_en' =>
                'required|string|max:255',

            'title_hi' =>
                'nullable|string|max:255',

            'is_free_preview' =>
                'nullable|boolean',

            'description_en' =>
                'nullable|string',

            'description_hi' =>
                'nullable|string',

            'status' =>
                'nullable|in:draft,published,archived',

            'published_at' =>
                'nullable|date',

            'order' =>
                'nullable|integer|min:1',
        ]);

        //change 2
        $lessonUpload = LessonUpload::where(
            'upload_uuid',
            $validated['upload_uuid']
        )->first();

        if (!$lessonUpload) {
           return response()->json([
                'status' => false,
                'message' => 'Lesson video upload session not found.'
            ], 404);
        }

        if ((int) $lessonUpload->user_id !== (int) $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized video upload session.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Lesson already created
        |--------------------------------------------------------------------------
        */

        if ($lessonUpload->lesson_id) {

            $lesson = Lesson::with([
                'media',
                'translations',
                'module'
            ])->find($lessonUpload->lesson_id);

            if ($lesson) {

                return response()->json([
                    'status' => true,
                    'message' => 'Lesson has already been created.',
                    'lesson_id' => $lesson->id,
                    'lesson' =>
                        $this->formatLesson($lesson),
                ], 200);
            }
        }

        if ($lessonUpload->status !== 'processed') {
            return response()->json([
                'status' => false,
                'message' => 'Lesson video has not finished processing.'
            ], 409);
        }



        /*
        |--------------------------------------------------------------------------
        | Find permanent General module
        |--------------------------------------------------------------------------
        |
        | Every newly created lesson starts inside General.
        |
        */

        $generalModule = CourseModule::where(
            'course_id',
            $courseId
        )
        ->where(
            'title',
            'General'
        )
        ->first();


        if (!$generalModule) {
            return response()->json([
                'status' => false,
                'message' =>
                    'General module not found for this course.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Determine lesson order
        |--------------------------------------------------------------------------
        |
        | Keep order course-wide because lessons can later
        | be moved between modules.
        |
        */

        $lastOrder = Lesson::where(
            'course_id',
            $courseId
        )->max('order') ?? 0;


        $order =
            $validated['order']
            ?? ($lastOrder + 1);


        /*
        |--------------------------------------------------------------------------
        | Create lesson
        |--------------------------------------------------------------------------
        */

        $lesson = Lesson::create([

            'module_id' => $generalModule->id,

            'course_id' => $courseId,

            'title' => $validated['title_en'],

            'order' => $order,

            'is_free_preview' => $validated['is_free_preview'] ?? false,

            'uploaded_by' => $user->id,

            'description' => $validated['description_en'] ?? null,

            'status' => $validated['status'] ?? 'draft',

            'published_at' => $validated['published_at'] ?? null,

            /*|--------------------------------------------------------------------------
            | HLS video
            |--------------------------------------------------------------------------
            */

            'bunny_storage_path' => $lessonUpload->hls_storage_path,

            'storage_object_name' => 'playlist.m3u8',

            'bunny_video_url' =>
                rtrim(env('BUNNY_PULLZONE_URL'), '/') .
                '/' .
                $lessonUpload->hls_storage_path .
                '/playlist.m3u8',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Link LessonUpload to created Lesson
        |--------------------------------------------------------------------------
        */

        $lessonUpload->update([
            'lesson_id' => $lesson->id,
        ]);


        /*
        |--------------------------------------------------------------------------
        | Save manually supplied Hindi translations
        |--------------------------------------------------------------------------
        */

        $lesson->saveTranslation(
            'title',
            'hi',
            $validated['title_hi'] ?? null
        );

        $lesson->saveTranslation(
            'description',
            'hi',
            $validated['description_hi'] ?? null
        );

        /*
        |--------------------------------------------------------------------------
        | Automatically translate only missing Hindi fields
        |--------------------------------------------------------------------------
        */

        $fieldsToTranslate = [];

        if (
            !isset($validated['title_hi']) ||
            trim((string) $validated['title_hi']) === ''
        ) {
            $fieldsToTranslate[] = 'title';
        }

        if (
            !isset($validated['description_hi']) ||
            trim((string) $validated['description_hi']) === ''
        ) {
            $fieldsToTranslate[] = 'description';
        }

        if (!empty($fieldsToTranslate)) {
            $lesson->translateFields(
                $fieldsToTranslate,
                'hi'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'status' => true,

            'message' => 'Lesson created successfully',

            'lesson_id' => $lesson->id,

            'lesson' =>
                $this->formatLesson(
                    $lesson->load([
                        'media',
                        'translations',
                        'module'
                    ])
                ),

        ], 201);
    }

    /**
     * Upload study materials to bunny server
     */  

    private function uploadMaterialToBunny(
        Lesson $lesson,
        \Illuminate\Http\UploadedFile $file,
        int $userId
    ) {
        $storageZone = env('BUNNY_STORAGE_ZONE');

        $regionHost = env(
            'BUNNY_REGION',
            'de.storage.bunnycdn.com'
        );

        $accessKey = env('BUNNY_API_KEY');

        $pullZone = rtrim(
            env('BUNNY_PULLZONE_URL'),
            '/'
        );

        $courseNameSlug = Str::slug(
            $lesson->course->title
                ?? 'course-' . $lesson->course_id
        );

        $folderPath =
            "{$courseNameSlug}/lesson-materials";

        $originalName =
            $file->getClientOriginalName();

        $extension =
            strtolower(
                $file->getClientOriginalExtension()
            );

        $originalBaseName =
            pathinfo(
                $originalName,
                PATHINFO_FILENAME
            );

        $fileTitleSlug =
            Str::slug($originalBaseName);

        $fileName =
            "{$lesson->id}-{$fileTitleSlug}-" .
            Str::uuid() .
            ".{$extension}";

        $fullPath =
            "{$folderPath}/{$fileName}";

        $uploadUrl =
            "https://{$regionHost}/" .
            "{$storageZone}/{$fullPath}";

        $bunnyStartTime = microtime(true);

        Log::info('BUNNY MATERIAL UPLOAD STARTED', [
            'lesson_id' => $lesson->id,
            'filename' => $originalName,
            'size_bytes' => $file->getSize(),
            'full_path' => $fullPath,
        ]);

        $inputStream =
            fopen(
                $file->getRealPath(),
                'rb'
            );

        $ch = curl_init($uploadUrl);

        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => 'PUT',
            CURLOPT_RETURNTRANSFER => true,

            CURLOPT_HTTPHEADER => [
                "AccessKey: {$accessKey}",
                "Content-Type: " .
                    (
                        $file->getMimeType()
                        ?: 'application/octet-stream'
                    ),
            ],

            CURLOPT_UPLOAD => true,

            CURLOPT_INFILESIZE =>
                filesize($file->getRealPath()),

            CURLOPT_TIMEOUT => 0,
            CURLOPT_CONNECTTIMEOUT => 0,

            CURLOPT_INFILE => $inputStream,
        ]);

        $response = curl_exec($ch);

        $status = curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        $curlError = curl_error($ch);

        $bunnyDuration = round(
            microtime(true) - $bunnyStartTime,
            3
        );

        Log::info('BUNNY MATERIAL UPLOAD RESPONSE', [
            'lesson_id' => $lesson->id,
            'filename' => $originalName,
            'status' => $status,
            'duration_seconds' => $bunnyDuration,
            'curl_error' => $curlError ?: null,
        ]);

        fclose($inputStream);
        curl_close($ch);

        if ($status !== 201 && $status !== 200) {
            throw new \Exception(
                "Material upload failed for {$originalName}. " .
                "Bunny status: {$status}. {$curlError}"
            );
        }

        $bunnyUrl =
            "{$pullZone}/{$fullPath}";

        $media = Media::create([
            'url' => $bunnyUrl,
            'original_name' => $originalName,
            'type' => 'lesson_resource',
            'uploaded_by' => $userId,
            'owner_id' => $lesson->id,
            'owner_type' => Lesson::class,
        ]);

        Log::info('MATERIAL MEDIA RECORD CREATED', [
            'lesson_id' => $lesson->id,
            'media_id' => $media->id,
            'filename' => $originalName,
        ]);

        return $media;
    }

    /**
     * Delete study materials for an existing lesson in bunny server
     */
    // private function deleteBunnyMaterial(Media $media)
    // {
    //     $storageZone = env('BUNNY_STORAGE_ZONE');
    //     $regionHost  = env('BUNNY_REGION', 'de.storage.bunnycdn.com');
    //     $accessKey   = env('BUNNY_API_KEY');

    //     $path = parse_url($media->url, PHP_URL_PATH);

    //     if (!$path) {
    //         throw new \Exception('Invalid Bunny material URL.');
    //     }

    //     $path = ltrim($path, '/');

    //     $deleteUrl = "https://{$regionHost}/{$storageZone}/{$path}";

    //     $response = Http::withHeaders([
    //         'AccessKey' => $accessKey,
    //     ])->delete($deleteUrl);

    //     if (!$response->successful() && $response->status() !== 404) {
    //         throw new \Exception(
    //             "Failed to delete Bunny material. " .
    //             "Status: {$response->status()}"
    //         );
    //     }

    //     return true;
    // } 

    private function deleteBunnyMaterial(Media $media)
    {
        return app(BunnyStorageService::class)
            ->deleteMaterial($media);
    }


    /**
     * Delete lesson video from Bunny Storage on cacel of upload .
     */
    private function deleteBunnyVideo(Lesson $lesson)
    {
        $storageZone = env('BUNNY_STORAGE_ZONE');
        $regionHost  = env('BUNNY_REGION', 'de.storage.bunnycdn.com');
        $accessKey   = env('BUNNY_API_KEY');

        $path = trim(
            $lesson->bunny_storage_path . '/' . $lesson->storage_object_name,
            '/'
        );

        if (!$path) {
            return true;
        }

        $deleteUrl = "https://{$regionHost}/{$storageZone}/{$path}";

        $response = Http::withHeaders([
            'AccessKey' => $accessKey,
        ])->delete($deleteUrl);

        /*
        * 404 is okay.
        *
        * It means the file is already gone, which is exactly what
        * we want after cancellation.
        */
        if (!$response->successful() && $response->status() !== 404) {
            throw new \Exception(
                "Failed to delete Bunny lesson video. " .
                "Status: {$response->status()}"
            );
        }

        return true;
    }

    private function deleteTemporaryBunnyVideo(
        string $storagePath,
        string $objectName
    ) {
        $storageZone = env(
            'BUNNY_STORAGE_ZONE'
        );

        $regionHost = env(
            'BUNNY_REGION',
            'de.storage.bunnycdn.com'
        );

        $accessKey = env(
            'BUNNY_API_KEY'
        );

        $path =
            trim($storagePath, '/') .
            '/' .
            rawurlencode(
                trim($objectName, '/')
            );

        if (!$path) {
            return true;
        }

        $deleteUrl =
            "https://{$regionHost}/{$storageZone}/{$path}";

        $response = Http::withHeaders([
            'AccessKey' => $accessKey,
        ])->delete($deleteUrl);

        /*
        |--------------------------------------------------------------------------
        | 404 = already deleted
        |--------------------------------------------------------------------------
        */

        if (
            !$response->successful() &&
            $response->status() !== 404
        ) {
            throw new \Exception(
                "Failed to delete temporary Bunny video. " .
                "Status: {$response->status()}. " .
                "Response: {$response->body()}"
            );
        }

        return true;
    }

    /**
     * Upload study materials while creating lessons first time
     */
    public function uploadMaterials(Request $request, $lessonId)
    {
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        $user   = Auth::user();

        $materialsStartTime = microtime(true);

        Log::info('LESSON MATERIAL UPLOAD STARTED', [
            'lesson_id' => $lesson->id,
            'course_id' => $lesson->course_id,
            'user_id'   => $user->id,
            'all_files_keys' => array_keys($request->allFiles()),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $request->validate([
            'materials' => [
                'required',
                'array',
                'min:1',
            ],

            'materials.*' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,zip,rar,7z',
                'max:40960',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Get uploaded files
        |--------------------------------------------------------------------------
        */

        $files = $request->file('materials');


        Log::info('MATERIAL RAW FILE INPUT', [
            'lesson_id' => $lesson->id,
            'type' => gettype($files),
            'is_array' => is_array($files),
            'count' => is_array($files) ? count($files) : ($files ? 1 : 0),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Normalize into a simple array
        |--------------------------------------------------------------------------
        */

        if (!is_array($files)) {
            $files = [$files];
        }

        $files = array_values($files);

        if (count($files) === 0) {
            return response()->json([
                'status' => false,
                'message' => 'No material files were received.'
            ], 422);
        }

        Log::info('MATERIAL FILE ARRAY READY', [
            'lesson_id' => $lesson->id,
            'file_count' => count($files),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Upload each material
        |--------------------------------------------------------------------------
        */

        $uploadedMaterials = [];

        foreach ($files as $index => $file) {

            Log::info('MATERIAL LOOP ENTERED', [
                'lesson_id' => $lesson->id,
                'index' => $index,
                'file_class' => is_object($file)
                    ? get_class($file)
                    : gettype($file),
            ]);


            /*
            |--------------------------------------------------------------------------
            | Make sure Laravel actually gave us an UploadedFile
            |--------------------------------------------------------------------------
            */

            if (!$file instanceof \Illuminate\Http\UploadedFile) {
                Log::error('INVALID MATERIAL OBJECT', [
                    'lesson_id' => $lesson->id,
                    'index' => $index,
                    'type' => is_object($file)
                        ? get_class($file)
                        : gettype($file),
                ]);

                return response()->json([
                    'status' => false,
                    'message' => "Material at index {$index} is not a valid uploaded file."
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Check upload validity
            |--------------------------------------------------------------------------
            */

            if (!$file->isValid()) {

                Log::error('INVALID MATERIAL UPLOAD', [
                    'lesson_id' => $lesson->id,
                    'index' => $index,
                    'filename' => $file->getClientOriginalName(),
                    'error' => $file->getError(),
                    'error_message' => $file->getErrorMessage(),
                ]);

                return response()->json([
                    'status' => false,
                    'message' =>
                        "Material upload failed: " .
                        $file->getClientOriginalName()
                ], 422);
            }

            Log::info('MATERIAL UPLOAD STARTED', [
                'lesson_id' => $lesson->id,
                'index' => $index,
                'filename' => $file->getClientOriginalName(),
                'size_bytes' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            $materialStartTime = microtime(true);

            /*
            |--------------------------------------------------------------------------
            | Upload to Bunny
            |--------------------------------------------------------------------------
            */

            $media = $this->uploadMaterialToBunny(
                $lesson,
                $file,
                $user->id
            );

            $materialDuration = round(
                microtime(true) - $materialStartTime,
                3
            );

            Log::info('MATERIAL UPLOAD COMPLETED', [
                'lesson_id' => $lesson->id,
                'index' => $index,
                'media_id' => $media->id,
                'filename' => $file->getClientOriginalName(),
                'duration_seconds' => $materialDuration,
            ]);

            $uploadedMaterials[] = [
                'id' => $media->id,
                'original_name' => $media->original_name,
                'url' => $media->url,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Refresh lesson materials
        |--------------------------------------------------------------------------
        */

        $lesson->unsetRelation('media');

        $lesson->load([
            'media',
            'translations'
        ]);

        Log::info('MATERIAL RELATION DEBUG', [
            'lesson_id' => $lesson->id,
            'media_count' => $lesson->media->count(),
            'media_ids' => $lesson->media->pluck('id')->toArray(),
        ]);

        Log::info('MATERIAL ACCESSOR DEBUG', [
            'lesson_id' => $lesson->id,
            'materials_count' => count($lesson->materials),
            'materials' => $lesson->materials,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Complete
        |--------------------------------------------------------------------------
        */

        $materialsDuration = round(
            microtime(true) - $materialsStartTime,
            3
        );

        Log::info('LESSON MATERIAL UPLOAD COMPLETED', [
            'lesson_id' => $lesson->id,
            'materials_count' => count($uploadedMaterials),
            'total_duration_seconds' => $materialsDuration,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Materials uploaded successfully',
            'materials' => $uploadedMaterials,
            'lesson' => $this->formatLesson($lesson),
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
            'status' => 'draft'
        ]);

        return response()->json(['status' => true, 'message' => 'Upload finalized', 'bunny_video_url' => $lesson->bunny_video_url]);
    }

    /**
     * Cancel an in-progress lesson upload.
     *
     * Deletes the temporary Bunny file and the temporary
     * LessonUpload record. No Lesson is created at this stage.
     */

    // public function cancelUpload(Request $request, $uploadUuid)
    // {
    //     $user = Auth::user();

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Authorization
    //     |--------------------------------------------------------------------------
    //     */

    //     if (!$user->hasAnyRole([
    //         'teacher',
    //         'moderator',
    //         'admin',
    //         'super_admin'
    //     ])) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ], 403);
    //     }

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Validate UUID
    //     |--------------------------------------------------------------------------
    //     */

    //     if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Invalid upload UUID.'
    //         ], 422);
    //     }

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Atomically request cancellation
    //     |--------------------------------------------------------------------------
    //     */

    //     $result = DB::transaction(function () use (
    //         $uploadUuid,
    //         $user
    //     ) {

    //         $upload = LessonUpload::where(
    //             'upload_uuid',
    //             $uploadUuid
    //         )
    //         ->lockForUpdate()
    //         ->first();

    //         if (!$upload) {
    //             return [
    //                 'response' => response()->json([
    //                     'status' => false,
    //                     'message' => 'Upload session not found.'
    //                 ], 404),
    //                 'upload' => null,
    //             ];
    //         }

    //         /*
    //         |--------------------------------------------------------------------------
    //         | Ownership
    //         |--------------------------------------------------------------------------
    //         */

    //         if ((int) $upload->user_id !== (int) $user->id) {
    //             return [
    //                 'response' => response()->json([
    //                     'status' => false,
    //                     'message' => 'Unauthorized.'
    //                 ], 403),
    //                 'upload' => null,
    //             ];
    //         }

    //         /*
    //         |--------------------------------------------------------------------------
    //         | Already cancelled
    //         |--------------------------------------------------------------------------
    //         */

    //         if ($upload->status === 'cancelled') {
    //             return [
    //                 'response' => response()->json([
    //                     'status' => true,
    //                     'message' => 'Upload was already cancelled.'
    //                 ]),
    //                 'upload' => null,
    //             ];
    //         }

    //         /*
    //         |--------------------------------------------------------------------------
    //         | Already completed
    //         |--------------------------------------------------------------------------
    //         */

    //         if ($upload->status === 'completed') {
    //             return [
    //                 'response' => response()->json([
    //                     'status' => false,
    //                     'message' =>
    //                         'This upload has already been completed.'
    //                 ], 409),
    //                 'upload' => null,
    //             ];
    //         }

    //         /*
    //         |--------------------------------------------------------------------------
    //         | Already cancelling
    //         |--------------------------------------------------------------------------
    //         */

    //         if ($upload->status === 'cancelling') {
    //             return [
    //                 'response' => response()->json([
    //                     'status' => true,
    //                     'message' =>
    //                         'Cancellation is already in progress.'
    //                 ]),
    //                 'upload' => null,
    //             ];
    //         }

    //         /*
    //         |--------------------------------------------------------------------------
    //         | Request cancellation
    //         |--------------------------------------------------------------------------
    //         |
    //         | This is the important state transition.
    //         |
    //         | processHls() can no longer change this upload to "processed"
    //         | because its final update requires status = "processing".
    //         |
    //         */

    //         $upload->update([
    //             'status' => 'cancelling',
    //         ]);

    //         return [
    //             'response' => null,
    //             'upload' => $upload,
    //         ];
    //     });

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Immediate response
    //     |--------------------------------------------------------------------------
    //     */

    //     if ($result['response']) {
    //         return $result['response'];
    //     }

    //     $upload = $result['upload'];

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Cleanup
    //     |--------------------------------------------------------------------------
    //     |
    //     | At this point the upload is already "cancelling".
    //     |
    //     | processHls() is therefore no longer allowed to mark it "processed".
    //     | However, processHls() may still be running FFmpeg or uploading to Bunny.
    //     |
    //     | We perform cleanup here, then finalize cancellation only if the state
    //     | is still "cancelling".
    //     |--------------------------------------------------------------------------
    //     */

    //     try {


    //         /*
    //         |--------------------------------------------------------------------------
    //         | Finalize cancellation atomically
    //         |--------------------------------------------------------------------------
    //         */

    //         $updated = LessonUpload::where(
    //             'id',
    //             $upload->id
    //         )
    //         ->where('status', 'cancelling')
    //         ->update([
    //             'status' => 'cancelled',
    //         ]);


    //         /*
    //         |--------------------------------------------------------------------------
    //         | Another operation changed the state
    //         |--------------------------------------------------------------------------
    //         */

    //         if ($updated !== 1) {

    //             $upload->refresh();

    //             \Log::warning(
    //                 'UPLOAD CANCELLATION STATE CHANGED DURING CLEANUP',
    //                 [
    //                     'upload_uuid' =>
    //                         $upload->upload_uuid,

    //                     'status' =>
    //                         $upload->status,
    //                 ]
    //             );

    //             return response()->json([
    //                 'status' => false,
    //                 'message' =>
    //                     'Upload cancellation could not be finalized.'
    //             ], 409);
    //         }


    //         \Log::info(
    //             'LESSON UPLOAD CANCELLED',
    //             [
    //                 'upload_uuid' =>
    //                     $upload->upload_uuid,

    //                 'user_id' =>
    //                     $user->id,
    //             ]
    //         );


    //         return response()->json([
    //             'status' => true,
    //             'message' =>
    //                 'Lesson upload cancelled successfully.'
    //         ]);


    //     } catch (\Throwable $e) {

    //         \Log::error(
    //             'LESSON UPLOAD CANCELLATION FAILED',
    //             [
    //                 'upload_uuid' =>
    //                     $uploadUuid,

    //                 'user_id' =>
    //                     $user->id,

    //                 'error' =>
    //                     $e->getMessage(),
    //             ]
    //         );


    //         /*
    //         |--------------------------------------------------------------------------
    //         | IMPORTANT
    //         |--------------------------------------------------------------------------
    //         |
    //         | Keep the state as "cancelling".
    //         |
    //         | Do NOT change it back to uploaded, processing, or processed.
    //         |
    //         */

    //         return response()->json([
    //             'status' => false,
    //             'message' =>
    //                 'Failed to completely cancel the lesson upload.'
    //         ], 500);
    //     }
    // }
    
    public function cancelUpload(Request $request, $uploadUuid)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate UUID
        |--------------------------------------------------------------------------
        */

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid upload UUID.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Atomically request cancellation
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(function () use (
            $uploadUuid,
            $user
        ) {

            $upload = LessonUpload::where(
                'upload_uuid',
                $uploadUuid
            )
            ->lockForUpdate()
            ->first();

            if (!$upload) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload session not found.'
                    ], 404),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Ownership
            |--------------------------------------------------------------------------
            */

            if ((int) $upload->user_id !== (int) $user->id) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Unauthorized.'
                    ], 403),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Already cancelled
            |--------------------------------------------------------------------------
            */

            if ($upload->status === 'cancelled') {
                return [
                    'response' => response()->json([
                        'status' => true,
                        'message' => 'Upload was already cancelled.'
                    ]),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Already completed
            |--------------------------------------------------------------------------
            */

            if ($upload->status === 'completed') {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' =>
                            'This upload has already been completed.'
                    ], 409),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Already cancelling
            |--------------------------------------------------------------------------
            */

            if ($upload->status === 'cancelling') {
                return [
                    'response' => response()->json([
                        'status' => true,
                        'message' =>
                            'Cancellation is already in progress.'
                    ]),
                    'upload' => null,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Request cancellation
            |--------------------------------------------------------------------------
            |
            | This is the important state transition.
            |
            | processHls() can no longer change this upload to "processed"
            | because its final update requires status = "processing".
            |
            */

            $upload->update([
                'status' => 'cancelling',
            ]);

            return [
                'response' => null,
                'upload' => $upload,
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | Immediate response
        |--------------------------------------------------------------------------
        */

        if ($result['response']) {
            return $result['response'];
        }

        $upload = $result['upload'];

        /*
        |--------------------------------------------------------------------------
        | Cleanup
        |--------------------------------------------------------------------------
        |
        | At this point the upload is already "cancelling".
        |
        | processHls() is therefore no longer allowed to mark it "processed".
        | However, processHls() may still be running FFmpeg or uploading to Bunny.
        |
        | We perform cleanup here, then finalize cancellation only if the state
        | is still "cancelling".
        |--------------------------------------------------------------------------
        */

        try {

            /*
            |--------------------------------------------------------------------------
            | Cancellation has been requested.
            |
            | DO NOT change "cancelling" to "cancelled" here.
            |
            | ProcessLessonHls is still running and must see the "cancelling"
            | state so it can stop FFmpeg, stop Bunny uploads and clean up.
            |--------------------------------------------------------------------------
            */

            \Log::info(
                'LESSON UPLOAD CANCELLATION REQUESTED',
                [
                    'upload_uuid' => $upload->upload_uuid,
                    'user_id' => $user->id,
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Lesson upload cancellation requested.'
            ], 202);

        } catch (\Throwable $e) {

            \Log::error(
                'LESSON UPLOAD CANCELLATION FAILED',
                [
                    'upload_uuid' =>
                        $uploadUuid,

                    'user_id' =>
                        $user->id,

                    'error' =>
                        $e->getMessage(),
                ]
            );


            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            |
            | Keep the state as "cancelling".
            |
            | Do NOT change it back to uploaded, processing, or processed.
            |
            */

            return response()->json([
                'status' => false,
                'message' =>
                    'Failed to completely cancel the lesson upload.'
            ], 500);
        }
    }

    public function completeUpload(Request $request, $uploadUuid)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (!$user->hasAnyRole([
            'teacher',
            'moderator',
            'admin',
            'super_admin'
        ])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Validate UUID
        |--------------------------------------------------------------------------
        */

        if (!$uploadUuid || !Str::isUuid($uploadUuid)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid upload UUID.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Atomically claim upload
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(function () use (
            $uploadUuid,
            $user
        ) {

            $upload = LessonUpload::where(
                'upload_uuid',
                $uploadUuid
            )
            ->lockForUpdate()
            ->first();


            /*
            |--------------------------------------------------------------------------
            | Not found
            |--------------------------------------------------------------------------
            */

            if (!$upload) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload session not found.'
                    ], 404),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Ownership
            |--------------------------------------------------------------------------
            */

            if ((int) $upload->user_id !== (int) $user->id) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Unauthorized.'
                    ], 403),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Cancellation states
            |--------------------------------------------------------------------------
            */

            if (
                $upload->status === 'cancelling' ||
                $upload->status === 'cancelled'
            ) {
                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Upload was cancelled.'
                    ], 409),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Already processing
            |--------------------------------------------------------------------------
            */

            if ($upload->status === 'processing') {

                return [
                    'response' => response()->json([
                        'status' => true,
                        'message' => 'HLS processing is already in progress.',
                        'upload_uuid' => $upload->upload_uuid,
                        'upload_status' => 'processing',
                        'processing' => true,
                        'completed' => false,
                    ], 202),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Already processed
            |--------------------------------------------------------------------------
            */

            if ($upload->status === 'processed') {

                return [
                    'response' => response()->json([
                        'status' => true,
                        'message' => 'HLS processing has already completed.',
                        'upload_uuid' => $upload->upload_uuid,
                        'upload_status' => 'processed',
                        'processing' => false,
                        'completed' => true,
                        'hls_storage_path' =>
                            $upload->hls_storage_path,
                        'playlist' =>
                            $upload->hls_storage_path
                                ? "{$upload->hls_storage_path}/playlist.m3u8"
                                : null,
                    ], 200),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Upload must be completely uploaded first
            |--------------------------------------------------------------------------
            */

            if ($upload->status !== 'uploaded') {

                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' =>
                            'Upload is not ready for HLS processing.',
                        'upload_status' => $upload->status,
                    ], 422),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Verify temporary file exists
            |--------------------------------------------------------------------------
            */

            if (!$upload->temporary_file_path) {

                $upload->update([
                    'status' => 'failed'
                ]);

                return [
                    'response' => response()->json([
                        'status' => false,
                        'message' => 'Temporary video file is missing.'
                    ], 422),

                    'upload' => null,
                ];
            }


            /*
            |--------------------------------------------------------------------------
            | Claim for background processing
            |--------------------------------------------------------------------------
            */

            $upload->update([
                'status' => 'processing',
            ]);


            return [
                'response' => null,
                'upload' => $upload,
            ];
        });


        /*
        |--------------------------------------------------------------------------
        | Immediate response
        |--------------------------------------------------------------------------
        */

        if ($result['response']) {
            return $result['response'];
        }


        $upload = $result['upload'];


        /*
        |--------------------------------------------------------------------------
        | Dispatch background job
        |--------------------------------------------------------------------------
        */

        ProcessLessonHls::dispatch(
            $upload->upload_uuid
        );


        /*
        |--------------------------------------------------------------------------
        | Return immediately
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'status' => true,
            'message' => 'HLS processing has started.',
            'upload_uuid' => $upload->upload_uuid,
            'upload_status' => 'processing',
            'processing' => true,
            'completed' => false,
        ], 202);
    }

    /**
     * Update a lesson
     */
    public function updateLesson(Request $request, $courseId, $id)
    {
        \Log::info('1. UPDATE LESSON REACHED');
            $course = Course::findOrFail($courseId);
            $lesson = Lesson::with('translations','module')->where('course_id', $courseId)->findOrFail($id);

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
                // 'module_id' => 'nullable|exists:course_modules,id',
                'title_en'         => 'sometimes|required|string|max:255',
                'title_hi'         => 'nullable|string|max:255',
                'description_en'   => 'nullable|string',
                'description_hi'   => 'nullable|string',
                'is_free_preview' => 'boolean',
                'status'          => 'nullable|in:draft,published,archived',
                'materials.*'     => [
                                        'nullable',
                                        'file',
                                        'mimes:pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,zip,rar,7z',
                                        'max:40960',
                                    ],                
                'removed_materials' => 'nullable|array',
                'removed_materials.*' => 'integer',

            ]);

            \Log::info('UPDATE LESSON - VALIDATION PASSED');

                                    

            // ------------------- OLD VALUES -----------------------

            $oldTitleEn = $lesson->title;
            $oldDescEn  = $lesson->description;

            $translationHi = $lesson->translations()
                ->where('locale', 'hi')
                ->first();

            $oldTitleHi = $translationHi?->title;
            $oldDescHi  = $translationHi?->description;


            // ------------------- NEW VALUES -----------------------

            $newTitleEn = $request->title_en;
            $newDescEn  = $request->description_en;

            $newTitleHi = $request->title_hi;
            $newDescHi  = $request->description_hi;


            // ------------------- DETECT ENGLISH CHANGES -----------------------

            $titleEnChanged =
                $request->has('title_en') &&
                $newTitleEn !== $oldTitleEn;

            $descEnChanged =
                $request->has('description_en') &&
                $newDescEn !== $oldDescEn;


            // ------------------- DETECT REAL MANUAL HINDI INPUT -----------------------

            $titleHiManuallyChanged =
                $request->has('title_hi') &&
                $newTitleHi !== null &&
                $newTitleHi !== '' &&
                $newTitleHi !== $oldTitleHi;

            $descHiManuallyChanged =
                $request->has('description_hi') &&
                $newDescHi !== null &&
                $newDescHi !== '' &&
                $newDescHi !== $oldDescHi;


            // ------------------- SAVE MANUAL HINDI -----------------------

            if ($titleHiManuallyChanged) {
                $lesson->saveTranslation(
                    'title',
                    'hi',
                    $newTitleHi
                );
            }

            if ($descHiManuallyChanged) {
                $lesson->saveTranslation(
                    'description',
                    'hi',
                    $newDescHi
                );
            }

            \Log::info('UPDATE LESSON - BEFORE DB UPDATE', [
                'title' => $newTitleEn,
                'description' => $newDescEn,
                'status' => $request->status,
                'is_free_preview' => $request->is_free_preview,
            ]);


            // ------------------- UPDATE ENGLISH-------------------

            $oldStatus = $lesson->status;

            $newStatus = $request->has('status')
                ? $request->status
                : $lesson->status;

            $publishedAt = $lesson->published_at;

            // First-ever publication only
            if (
                $newStatus === 'published' &&
                empty($lesson->published_at)
            ) {
                $publishedAt = now();
            }

            $lesson->update([
                // 'module_id' => $request->module_id ?? $lesson->module_id,
                'title'          => $newTitleEn ?? $lesson->title,
                'description'    => $newDescEn ?? $lesson->description,
                'is_free_preview' => $request->is_free_preview ?? $lesson->is_free_preview,
                'status'         => $request->status ?? $lesson->status,
                'published_at'   => $publishedAt,
            ]);

            \Log::info('UPDATE LESSON - DB UPDATE PASSED', [
        'lesson_title' => $lesson->fresh()->title,
            ]);

        // ------------------- AUTO TRANSLATION -----------------------

        \Log::info('UPDATE LESSON - AUTO TRANSLATION CHECK STARTED', [
            'lesson_id' => $lesson->id,
            'title_en_changed' => $titleEnChanged,
            'description_en_changed' => $descEnChanged,
            'title_hi_manually_changed' => $titleHiManuallyChanged,
            'description_hi_manually_changed' => $descHiManuallyChanged,
        ]);

        $fieldsToTranslate = [];

        // English title changed AND Hindi was not manually changed
        if (
            $titleEnChanged &&
            !$titleHiManuallyChanged
        ) {
            $fieldsToTranslate[] = 'title';

            \Log::info('UPDATE LESSON - TITLE MARKED FOR AUTO TRANSLATION', [
                'lesson_id' => $lesson->id,
                'english_title' => $lesson->title,
            ]);
        }

        // English description changed AND Hindi was not manually changed
        if (
            $descEnChanged &&
            !$descHiManuallyChanged
        ) {
            $fieldsToTranslate[] = 'description';

            \Log::info('UPDATE LESSON - DESCRIPTION MARKED FOR AUTO TRANSLATION', [
                'lesson_id' => $lesson->id,
                'english_description' => $lesson->description,
            ]);
        }


        if (!empty($fieldsToTranslate)) {

            \Log::info('UPDATE LESSON - AUTO TRANSLATION REQUIRED', [
                'lesson_id' => $lesson->id,
                'fields' => $fieldsToTranslate,
            ]);


            // Get or create Hindi translation row
            $translationHi = $lesson->translations()
                ->firstOrCreate([
                    'locale' => 'hi'
                ]);


            \Log::info('UPDATE LESSON - HINDI TRANSLATION ROW READY', [
                'lesson_id' => $lesson->id,
                'translation_id' => $translationHi->id,
                'locale' => $translationHi->locale,
                'existing_title_hi' => $translationHi->title,
                'existing_description_hi' => $translationHi->description,
            ]);


            // Clear only fields that need fresh auto translation
            foreach ($fieldsToTranslate as $field) {

                \Log::info('UPDATE LESSON - CLEARING OLD TRANSLATION FIELD', [
                    'lesson_id' => $lesson->id,
                    'translation_id' => $translationHi->id,
                    'field' => $field,
                ]);

                $translationHi->$field = null;
            }


            $translationHi->save();


            // Verify clearing actually reached DB
            $translationAfterClear = $lesson->translations()
                ->where('locale', 'hi')
                ->first();

            \Log::info('UPDATE LESSON - TRANSLATION FIELD CLEARED IN DB', [
                'lesson_id' => $lesson->id,
                'translation_id' => $translationAfterClear?->id,
                'title_hi' => $translationAfterClear?->title,
                'description_hi' => $translationAfterClear?->description,
            ]);


            // ------------------- GENERATE TRANSLATION -------------------

            \Log::info('UPDATE LESSON - CALLING TRANSLATE FIELDS', [
                'lesson_id' => $lesson->id,
                'translation_id' => $translationHi->id,
                'fields' => $fieldsToTranslate,
                'target_locale' => 'hi',
            ]);


            try {

                $translationResult = $lesson->translateFields(
                    $fieldsToTranslate,
                    'hi'
                );


                \Log::info('UPDATE LESSON - TRANSLATE FIELDS RETURNED', [
                    'lesson_id' => $lesson->id,
                    'translation_id' => $translationHi->id,
                    'result' => $translationResult,
                ]);

            } catch (\Throwable $e) {

                \Log::error('UPDATE LESSON - TRANSLATION GENERATION FAILED', [
                    'lesson_id' => $lesson->id,
                    'translation_id' => $translationHi->id,
                    'fields' => $fieldsToTranslate,
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);

                throw $e;
            }


            // ------------------- VERIFY DATABASE -------------------

            $translationFromDb = $lesson->translations()
                ->where('locale', 'hi')
                ->first();

            \Log::info('UPDATE LESSON - TRANSLATION VERIFIED FROM DB', [
                'lesson_id' => $lesson->id,
                'translation_id' => $translationFromDb?->id,
                'title_hi' => $translationFromDb?->title,
                'description_hi' => $translationFromDb?->description,
            ]);

        } else {

            \Log::info('UPDATE LESSON - NO AUTO TRANSLATION REQUIRED', [
                'lesson_id' => $lesson->id,
            ]);
        }


        \Log::info('UPDATE LESSON - TRANSLATION PASSED', [
            'lesson_id' => $lesson->id,
        ]);


        \Log::info('UPDATE LESSON - TRANSLATION PASSED');
            // --------- Remove materials if requested
            if ($request->filled('removed_materials')) {

                $materialIds = array_filter(
                    (array) $request->input('removed_materials', [])
                );

                $medias = $lesson->media()
                    ->whereIn('id', $materialIds)
                    ->get();

                foreach ($medias as $media) {

                    $this->deleteBunnyMaterial($media);

                    $media->forceDelete();
                }
            }

            // ✅ Upload new materials
            if ($request->hasFile('materials')) {

                $files = $request->file('materials');

                $files = is_array($files)
                    ? $files
                    : [$files];

                foreach ($files as $file) {

                    if (!$file instanceof UploadedFile) {
                        continue;
                    }

                    $this->uploadMaterialToBunny(
                        $lesson,
                        $file,
                        $user->id
                    );
                }
            }

        \Log::info('UPDATE LESSON - BEFORE RESPONSE');

            $lesson->unsetRelation('media');
            $lesson->unsetRelation('translations');

            $lesson->load([
                'media',
                'translations',
                'module'
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Lesson updated successfully',
                'lesson' => $this->formatLesson($lesson),
            ]);
    }

    /**
     * Download lesson Material
     */
    public function downloadMaterial($courseId, $materialId)
    {
        $lesson = Lesson::where('course_id', $courseId)
            ->whereHas('media', function ($query) use ($materialId) {
                $query->where('id', $materialId);
            })
            ->firstOrFail();

        $file = $lesson->media()
            ->where('id', $materialId)
            ->firstOrFail();

        $path = parse_url($file->url, PHP_URL_PATH);

        $signedUrl = $lesson->generateBunnySignedUrl($path);

        $response = Http::timeout(120)->get($signedUrl);

        if (!$response->successful()) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to download material.',
                'bunny_status' => $response->status(),
            ], 502);
        }

        $fileName = $file->original_name ?? basename($path);

        return response($response->body(), 200, [
            'Content-Type' => $response->header(
                'Content-Type',
                'application/octet-stream'
            ),

            'Content-Disposition' =>
                'attachment; filename="' .
                addslashes($fileName) .
                '"',

            'Content-Length' => strlen($response->body()),
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
        $course = $lesson->course;

        $isOwnerOrAssignedTeacher = (
            $actor->id === $course->created_by ||
            $actor->id === $course->teacher_id
        );

        if (
            !$isOwnerOrAssignedTeacher &&
            !$actor->hasAnyRole(['admin', 'super_admin'])
        ) {
            return response()->json([
                'status' => false,
                'message' => 'You are not allowed to delete this lesson.'
            ], 403);
        }
        // if ($lesson->uploaded_by !== $actor->id 
        //     && $lesson->course->created_by !== $actor->id 
        //     && !$actor->hasAnyRole(['admin', 'super_admin','teacher'])) {
        //     return response()->json([
        //         'status' => false,
        //         'message' => 'You are not allowed to delete this lesson.'
        //     ], 403);
        // }
        
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

            $course = $lesson->course;

            $isOwnerOrAssignedTeacher = (
                $actor->id === $course->created_by ||
                $actor->id === $course->teacher_id
            );

            if (
                !$isOwnerOrAssignedTeacher &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ) {
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to delete lesson: {$lesson->title}"
                ], 403);
              }
            
            // if (
            //     $lesson->uploaded_by !== $actor->id &&
            //     $lesson->course->created_by !== $actor->id &&
            //     !$actor->hasAnyRole(['admin', 'super_admin'])
            // ) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => "You are not allowed to delete lesson: {$lesson->title}"
            //     ], 403);
            // }


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
            $course = $lesson->course;

            $isOwnerOrAssignedTeacher = (
                $actor->id === $course->created_by ||
                $actor->id === $course->teacher_id
            );

            if (
                !$isOwnerOrAssignedTeacher &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ){
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to restore lesson: {$lesson->title}"
                ], 403);
            }

            // if (
            //     $lesson->uploaded_by !== $actor->id &&
            //     $lesson->course->created_by !== $actor->id &&
            //     !$actor->hasAnyRole(['admin', 'super_admin'])
            // ) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => "You are not allowed to restore lesson: {$lesson->title}"
            //     ], 403);
            // }

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

            $course = $lesson->course;

            $isOwnerOrAssignedTeacher = (
                $actor->id === $course->created_by ||
                $actor->id === $course->teacher_id
            );

            if (
                !$isOwnerOrAssignedTeacher &&
                !$actor->hasAnyRole(['admin', 'super_admin'])
            ) {
                return response()->json([
                    'status' => false,
                    'message' => "You are not allowed to permanently delete lesson: {$lesson->title}"
                ], 403);
            }

            // if (
            //     $lesson->uploaded_by !== $actor->id &&
            //     $lesson->course->created_by !== $actor->id &&
            //     !$actor->hasAnyRole(['admin', 'super_admin'])
            // ) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => "You are not allowed to permanently delete lesson: {$lesson->title}"
            //     ], 403);
            // }

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

        $isOwnerOrAssignedTeacher = (
            $actor->id === $course->created_by ||
            $actor->id === $course->teacher_id
        );

        if (
            !$isOwnerOrAssignedTeacher &&
            !$actor->hasAnyRole(['admin', 'super_admin'])
        )

        // if ($course->created_by !== $actor->id && !$actor->hasAnyRole(['admin', 'super_admin']))
         
        {
            return response()->json([
                'status' => false,
                'message' => 'You are not allowed to view trashed lessons for this course.'
            ], 403);
        }

        $trashed = Lesson::onlyTrashed()
            ->where('course_id', $courseId)
            ->with('media','module')
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
        // $user = $request->user();

        // $course = Course::findOrFail($courseId);

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
            ->where('id', $id)
            ->where('course_id', $courseId)
            ->where('uploaded_by', auth()->id())
            ->firstOrFail();

        if (!$lesson) {
            return response()->json([
                'status' => false, 
                'message' => 'Lesson not found or not authorized.'    
            ]);
        }

        $lesson->forceDelete();
        return response()->json([
            'status' => true, 
            'message' => 'Lesson permanently deleted.'
        ]);
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
            ->where('id', $id)
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
     * Verify and regenarate signed url for 10 min only
     */

    // public function refreshSignedUrl($id)
    // {
    //     $lesson = Lesson::findOrFail($id);

    //     // Important: ensure the current user can access the course/lesson
    //     if (! auth()->user() || ! method_exists(auth()->user(), 'canAccessLesson') || ! auth()->user()->canAccessLesson($lesson)) {
    //         return response()->json(['error' => 'Unauthorized'], 403);
    //     }

    //     return response()->json([
    //         'url' => $lesson->signed_url,
    //         'bunny_video_url' => $lesson->bunny_video_url,
    //         'expires_in' => env('BUNNY_TOKEN_EXPIRY', 600),
    //     ]);
    // }

    /**
     * Generate a fresh Bunny signed URL.
     */
    public function refreshSignedUrl($id)
    {
        $lesson = Lesson::findOrFail($id);

        // Check access
        $user = Auth::user();

        if(!$user) {
            return response()->json([
                'error' => 'Unauthenticated'
            ],401);
        }

        /*
        * Use the original Bunny video path.
        *
        * If bunny_video_url contains the full CDN URL,
        * generateBunnySignedUrl() handles it.
        */
        $signedUrl = $this->generateBunnySignedUrl(
            $lesson->bunny_video_url
        );

        return response()->json([
            'url' => $signedUrl,
            'expires_in' => (int) env('BUNNY_TOKEN_EXPIRY', 180),
        ]);
    }

    // public function refreshTestHlsUrl()
    // {
    //     $securityKey = env('BUNNY_SIGNING_KEY');

    //     $path = '/hsl-test-folder/playlist.m3u8';

    //     $expires = time() + 180;

    //     $tokenPath = '/hsl-test-folder/';

    //     $parameterData = 'token_path=' . $tokenPath;

    //     $hashableBase =
    //         $securityKey .
    //         $tokenPath .
    //         $expires .
    //         $parameterData;

    //     $token = base64_encode(
    //         hash('sha256', $hashableBase, true)
    //     );

    //     $token = strtr($token, '+/', '-_');
    //     $token = rtrim($token, '=');

    //     $zoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');

    //     $url =
    //         $zoneUrl .
    //         '/bcdn_token=' . $token .
    //         '&expires=' . $expires .
    //         '&token_path=' . rawurlencode($tokenPath) .
    //         $path;

    //     return response()->json([
    //         'url' => $url,
    //         'expires_at' => $expires,
    //         'expires_in' => 180,
    //     ]);
    // }

    // Test HLS URL
    // public function testHlsUrl()
    // {
    //     $securityKey = env('BUNNY_SIGNING_KEY');

    //     $path = '/hsl-test-folder/';
    //     $playlist = 'playlist.m3u8';

    //     $expires = time() + 3600;

    //     // Directory token
    //     $parameterData = 'token_path=' . $path;

    //     $hashableBase =
    //         $securityKey .
    //         $path .
    //         $expires .
    //         $parameterData;

    //     $token = base64_encode(
    //         hash('sha256', $hashableBase, true)
    //     );

    //     $token = strtr($token, '+/', '-_');
    //     $token = rtrim($token, '=');

    //     $zoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');

    //     // PATH-BASED TOKEN
    // $url =
    //     $zoneUrl .
    //     '/bcdn_token=' . $token .
    //     '&expires=' . $expires .
    //     '&token_path=' . rawurlencode($path) .
    //     $path .
    //     $playlist;

    //     return response($url, 200)
    //         ->header('Content-Type', 'text/plain');
    // }

    // public function testHlsUrl()
    // {
    //     $securityKey = env('BUNNY_SIGNING_KEY');

    //     $path = '/hsl-test-folder/playlist.m3u8';

    //     // TEST: 180 seconds
    //     $expires = time() + 180;

    //     // Directory containing playlist + segments
    //     $tokenPath = '/hsl-test-folder/';

    //     // Bunny requires token_path in the hash
    //     $parameterData = 'token_path=' . $tokenPath;

    //     $hashableBase =
    //         $securityKey .
    //         $tokenPath .
    //         $expires .
    //         $parameterData;

    //     $token = base64_encode(
    //         hash('sha256', $hashableBase, true)
    //     );

    //     $token = strtr($token, '+/', '-_');
    //     $token = rtrim($token, '=');

    //     $zoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');

    //     return response()->json([
    //         'url' =>
    //             $zoneUrl .
    //             '/bcdn_token=' . $token .
    //             '&expires=' . $expires .
    //             '&token_path=' . rawurlencode($tokenPath) .
    //             $path,

    //         'expires_at' => $expires,
    //         'expires_in' => 180,
    //     ]);
    // }

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

                    'hls_url' => url('/hls-test/playlist.m3u8'),

                    'order'    => $lesson->order,
                    'is_free_preview' => $lesson->is_free_preview,
                    'status'          => $lesson->status,
                    'is_locked'       => $lesson->is_locked,
                    'published_at'    => $lesson->published_at,
                    'updated_at'      => $lesson->updated_at,
                    'module' => [
                        'id' => $lesson->module?->id,
                        'title' => [
                            'en' => $lesson->module?->title ?? 'General',
                            'hi' => $lesson->module?->translateField('title', 'hi')
                                ?? $lesson->module?->title
                                ?? 'General',
                        ],
                    ],


                    // Map lesson media files as materials
                    'materials' => $lesson->media->map(fn ($file) => [
                        'id'   => $file->id,
                        'url'  => $lesson->generateBunnySignedUrl(
                            parse_url($file->url, PHP_URL_PATH)
                        ),
                        'name' => $file->original_name ?? basename($file->url),
                    ]),
                ];
    }

}
