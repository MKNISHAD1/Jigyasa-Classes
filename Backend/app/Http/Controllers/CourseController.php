<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Media;
use App\Models\Course;
use App\Models\CourseModule;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;


class CourseController extends Controller
{

    // Course-list for admin access role logged-in  useer
    public function courseList()
    {
        $user = Auth::user(); // may be null for public users

        if (!$user->hasAnyRole(['teacher','moderator','admin','super_admin'])) {
            return response() -> json([
                'status' => false,
                'message' => 'Unauthorized'
            ],403);

        }

        $query = Course::with([
                'thumbnail',
                'teacher',
                'creator',
                'category',
                'subcategory'
            ])
            ->withCount('lessons')
            ->orderByDesc('created_at');

        // 🔐 ADMIN / SUPER ADMIN
        if ($user->hasAnyRole(['admin','moderator', 'super_admin'])) {

            $courses = $query->get();

        }
        else {
            $courses = $query
                ->where('status', 'published')
                ->get();
        }

        // Format response (your existing logic)
        $courses = $courses->map(fn ($course) =>
            $this->formatCourseResponse($course)
        );

        return response()->json([
            'status'  => true,
            'courses' => $courses
        ]);
    }

    // Course list for public users

    public function publicCourseList()
    {
        $courses = Course::with([
                'thumbnail',
                'teacher',
                'creator',
                'category',
                'subcategory'
            ])
            ->withCount('lessons')
            ->where('status', 'published')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'courses' => $courses->map(
                fn($course) => $this->formatCourseResponse($course)
            )
        ]);
    }


     /**
     * View Courses publicly (for frontend)
     */
    
     public function publicCourseView($id)
    {
        $course = Course::with([
            'lessons.module', 
            'thumbnail', 
            'teacher',
            'category',
            'subcategory',
            'modules'
        ])->findOrFail($id);

        // SIMILAR COURSES

        $similarCourses = Course::with([
            'thumbnail',
            'teacher',
            'category',
            'subcategory',
        ])
        ->withCount('lessons')
        ->where('status', 'published')
        ->where('id', '!=', $course->id)
        ->where(function ($q) use ($course) {
            if ($course->subcategory_id) {
                $q->where('subcategory_id', $course->subcategory_id);
            } else {
                $q->where('category_id', $course->category_id);
            }
        })
        ->inRandomOrder()
        ->take(4)
        ->get();

        if (!$course) {
            return response()->json([
                'status' => false,
                'message' => 'Course not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'course' => $this->formatCourseResponse($course),

            // similar  courses
            'similar_courses' => $similarCourses->map(
                fn($item) => $this->formatCourseResponse($item)
            ),
        ]);
    }

    /**
     * Store a new course
     * - Only teacher/moderator/admin/superadmin allowed
     */
    public function createCourse(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasAnyRole(['teacher', 'moderator', 'admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to create courses'
            ], 403);
        }

        $validated = $request->validate([
            'title_en'         => 'required|string|max:255',
            'title_hi'         => 'nullable|string|max:255',
            'description_en'   => 'required|string',
            'description_hi'   => 'nullable|string',

            'language' => 'required|in:Hindi,English,Both',
            'difficulty_level' => 'required|in:Beginner,Intermediate,Advanced,All Levels',

            'highlights' => 'nullable|array',
            'highlights.*' => 'string|max:255',

            'highlights_hi' => 'nullable|array',
            'highlights_hi.*' => 'string|max:255',

            'category_id'   => 'required|exists:categories,id',
            'subcategory_id'=> 'nullable|exists:subcategories,id',
            'price'         => 'nullable|numeric|between :0,999999',
            'status'        => 'required|in:draft,published',
            'thumbnail'     => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'teacher_id'    => 'nullable|exists:users,id'
        ]);
        
        // Decide COurse Instructor
        $teacherId = $request->filled('teacher_id') 
                    ? $request->teacher_id
                    : $user->id;

        
        // preventy to asssign course to a student
        if ($request->filled('teacher_id')) {

            $assignedUser = User::find($teacherId);

            if (!$assignedUser->hasAnyRole([
                'teacher',
                'moderator',
                'admin',
                'super_admin'
            ])) {

                return response()->json([
                    'status' => false,
                    'message' => 'Selected user cannot be assigned as instructor.'
                ], 422);
            }
        }

        // Create course first 
        $course = Course::create([
            'title'        => $request->title_en,
            'description'  => $request->description_en,
            'category_id'     => $request->category_id,
            'subcategory_id'  => $request->subcategory_id,
            'price'        => $request->price,
            'status' => $request->status,
            'published_at' => $request->status === 'published' ? now() : null,
            // 'thumbnail_id' => $thumbnailId,
            'created_by'   => $user->id,
            'teacher_id' => $teacherId,

            'language' => $request->language,
            'difficulty_level' => $request->difficulty_level,
            'highlights' => $request->highlights,
            'rating' => 0,
        ]);

        $generalModule = CourseModule::create([
            'course_id' => $course->id,
            'title'     => 'General',
            'order'     => 0,
        ]);

        $generalModule->saveTranslation('title', 'hi', 'सामान्य');


        // Save translations
        $course->saveTranslation('title', 'hi', $request->title_hi);
        $course->saveTranslation('description', 'hi', $request->description_hi);
        $course->saveTranslation('highlights', 'hi', $request->highlights_hi);

        // Auto-generate Hindi translations for empty
        if (!$request->title_hi || !$request->description_hi || !$request->highlights_hi) {
            $course->translateFields(['title', 'description','highlights'], 'hi');
        }



        // Storng thumanil if provided
        if ($request->hasFile('thumbnail')) {
            $image = $request->file('thumbnail');
            $filename = Str::slug($request->title_en) . '_' . time() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('uploads/courses', $filename, 'public');

            
            // Create media record
            $media = Media::create([
                'url'    => $path,
                'type'   => 'course_thumbnail',
                'owner_id'   => $course->id,   // ✅ FIXED now relation with course module
                'owner_type' => Course::class, 
                'uploaded_by'=> $user->id, // it will store user id of uploader

            ]);
            
            $course->thumbnail_id = $media->id;
            $course->save();

        }


        return response()->json([
            'status' => true,
            'message' => 'Course created successfully',
            // chnage 3
            'course' => $this->formatCourseResponse($course->load(['thumbnail', 'teacher', 'creator', 'category', 'subcategory']))
        ], 201);
    }

    /**
     * Show a specific course with lessons
     */
    public function viewCourse($id)
    {
        $course = Course::with(['lessons.module','modules', 'thumbnail', 'teacher', 'creator', 'category', 'subcategory'])->findOrFail($id);

        return response()->json([
            'status' => true,
            //change  4
            'course' => $this->formatCourseResponse($course)
        ]);
    }

    /**
     * Update a course
     * - Admin/SuperAdmin can edit any
     * - Teacher/Moderator can edit only their own
     */
    public function updateCourse(Request $request, $id)
    {
        $user = Auth::user();
        $course = Course::with('translations')->findOrFail($id);
        
        // Allow either creator OR assigned teacher
        $isOwnerOrAssignedTeacher = (
            $user->id === $course->created_by ||
            $user->id === $course->teacher_id
        );
        
        /// Check permisison
        if (!$isOwnerOrAssignedTeacher && !$user->hasAnyRole(['admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to edit this course',
            ], 403);
        }

        // ---- 1. VALIDATION -------------------------------------
        $validated = $request->validate([
            'title_en'         => 'sometimes|string|max:255',
            'title_hi'        => 'nullable|string|max:255',
            'description_en'   => 'sometimes|string',
            'description_hi'  => 'nullable|string',
            'category_id'   => 'sometimes|exists:categories,id',
            'subcategory_id'=> 'nullable|exists:subcategories,id',
            'price'         => 'nullable|numeric|min:0',
            'status'        => 'sometimes|in:draft,published,archived',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'teacher_id' => 'sometimes|exists:users,id',

            'language' => 'sometimes|in:Hindi,English,Both',

            'difficulty_level' => 'sometimes|in:Beginner,Intermediate,Advanced,All Levels',

            'highlights' => 'nullable|array',
            'highlights.*' => 'string|max:255',

            'highlights_hi' => 'nullable|array',
            'highlights_hi.*' => 'string|max:255',

        ]);


        // -------------------- 2. LOAD OLD VALUES ------------------
        $oldTitleEn = $course->title;
        $oldDescEn  = $course->description;
        $oldHighlightsEn = $course->highlights ?? [];

        $translationHi = $course->translations()->where('locale', 'hi')->first();
        $oldTitleHi = $translationHi?->title ?? null;
        $oldDescHi  = $translationHi?->description ?? null;
        $oldHighlightsHi = $translationHi?->highlights ?? [];


        // -------------------- 3. NEW VALUES -----------------------
        $newTitleEn = $request->title_en;
        $newDescEn  = $request->description_en;
        $newHighlightsEn = $request->highlights;

        $newTitleHi = $request->title_hi;
        $newDescHi  = $request->description_hi;
        $newHighlightsHi = $request->highlights_hi;


        // -------------------- 4. DETECT ENGLISH CHANGES -----------
        $titleEnChanged = $request->has('title_en') && $newTitleEn !== $oldTitleEn;
        $descEnChanged  = $request->has('description_en') && $newDescEn !== $oldDescEn;
        $highlightsEnChanged =
            $request->has('highlights') &&
            $newHighlightsEn != $oldHighlightsEn;


        // -------------------- 5. DETECT REAL MANUAL HINDI INPUT ---
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

        $highlightsHiManuallyChanged =
            $request->has('highlights_hi') &&
            $newHighlightsHi != $oldHighlightsHi;


        // -------------------- 6. SAVE MANUAL HINDI ----------------
        if ($titleHiManuallyChanged) {
            $course->saveTranslation('title', 'hi', $newTitleHi);
        }

        if ($descHiManuallyChanged) {
            $course->saveTranslation('description', 'hi', $newDescHi);
        }

        if ($highlightsHiManuallyChanged) {
            $course->saveTranslation(
                'highlights',
                'hi',
                $newHighlightsHi
            );
        }

        // -------------------- 7. UPDATE MAIN COURSE FIELDS --------
        $course->update([
            // 'title'          => $newTitleEn,
            // 'description'    => $newDescEn,
            // 'category_id'    => $request->category_id,
            // 'subcategory_id' => $request->subcategory_id,
            // 'price'          => $request->price,
            // 'status'         => $request->status,
            // 'published_at'   => $request->status === 'published' ? now() : null,
            // 'teacher_id'     => $request->teacher_id ?? $course->teacher_id,
            // 'language' => $request->language,
            // 'difficulty_level' => $request->difficulty_level,
            // 'highlights' => $request->highlights,

                'title' => $request->title_en ?? $course->title,

                'description' => $request->description_en ?? $course->description,

                'category_id' => $request->category_id ?? $course->category_id,

                'subcategory_id' => $request->subcategory_id ?? $course->subcategory_id,

                'price' => $request->price ?? $course->price,

                'status' => $request->status ?? $course->status,

                'published_at' =>
                    ($request->status ?? $course->status) === 'published'
                        ? ($course->published_at ?? now())
                        : null,

                'teacher_id' =>
                    $request->teacher_id ?? $course->teacher_id,

                'language' =>
                    $request->language ?? $course->language,

                'difficulty_level' =>
                    $request->difficulty_level ?? $course->difficulty_level,

                'highlights' =>
                    $request->highlights ?? $course->highlights,
        ]);


        // -------------------- 8. FORCE AUTO TRANSLATE IF NEEDED ---
        $fieldsToTranslate = [];

        // EN changed AND HI not manually changed → auto translate
        if ($titleEnChanged && !$titleHiManuallyChanged) {
            $fieldsToTranslate[] = 'title';
        }

        if ($descEnChanged && !$descHiManuallyChanged) {
            $fieldsToTranslate[] = 'description';
        }

        if (
            $highlightsEnChanged &&
            !$highlightsHiManuallyChanged
        ) {
            $fieldsToTranslate[] = 'highlights';
        }

        if (!empty($fieldsToTranslate)) {

            // get or create Hindi translation row
            $translationHi = $course->translations()
                ->firstOrCreate(['locale' => 'hi']);

            // clear only the fields that require auto-translation
            foreach ($fieldsToTranslate as $field) {
                $translationHi->$field = null; // remove old Hindi
            }

            $translationHi->save();

            // now auto translate only those fields
            $course->translateFields($fieldsToTranslate, 'hi');
        }


        // -------------------- 9. HANDLE THUMBNAIL -----------------

        if ($request->hasFile('thumbnail')) {

            $image = $request->file('thumbnail');
            $filename = Str::slug($request->title_en ?? $course->title) . '_' . time() . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('uploads/courses', $filename, 'public');

            // Delete old thumbnail if exists
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail->url);
                $course->thumbnail->delete();
            }

            $media = Media::create([
                'url'        => $path,
                'type'       => 'course_thumbnail',
                'owner_id'   => $course->id,   // ✅ FIXED now relation with course module
                'owner_type' => Course::class, 
                'uploaded_by'=> $user->id, // it will store user id of uploader
            ]);

            $course->thumbnail_id = $media->id;
            $course->save();

        }

        return response()->json([
            'status'  => true,
            'message' => 'Course updated successfully',
            'course'  => $this->formatCourseResponse($course->load(['thumbnail', 'teacher', 'creator', 'category', 'subcategory']))

        ]);

    }

    /**
     * fetch the courses 
     * - moderator/Admin/SuperAdmin can seee all courses
     * - Teacher can see only created by him and assigned to him only
     */
    public function getMyCourses(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasAnyRole(['teacher', 'moderator', 'admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $courses = Course::with([
            'teacher',
            'creator',
            'category',
            'subcategory',
            'thumbnail',
            'modules',
            'lessons.module'
        ])
            ->where('created_by', $user->id)
            ->orWhere('teacher_id', $user->id)
            ->get();

        return response()->json([
            'status' => true,
            'courses' => $courses->map(
                fn($course) => $this->formatCourseResponse($course)
            )
        ]);
    }

    //     public function getMyCourses(Request $request)
    // {
    //     $user = Auth::user();

    //     if ($user->hasAnyRole(['admin', 'super_admin', 'moderator'])) {
    //         // Admins/mods get all courses
    //         $courses = Course::with(['teacher', 'creator', 'category', 'subcategory', 'thumbnail','modules','lessons.module'])->get();
    //     } elseif ($user->hasRole('teacher')) {
    //         // Teacher gets: courses they created OR assigned as teacher
    //         $courses = Course::with(['teacher', 'creator', 'category', 'subcategory', 'thumbnail','modules','lessons.module'])
    //             ->where('created_by', $user->id)
    //             ->orWhere('teacher_id', $user->id)
    //             ->get();

    //     } else {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ], 403);
    //     }

    //     return response()->json([
    //         'status'  => true,
    //     'courses' => $courses->map(fn($course) => $this->formatCourseResponse($course))
    //     ], 201);
    // }


    /**
     * Delete a course (soft delete)
     * - Admin/SuperAdmin can delete any
     * - Teacher/Moderator can delete only their own
     */
    public function deleteCourse($id)
    {
        $course = Course::findOrFail($id);
        $user = Auth::user();
        
        // Allow either creator OR assigned teacher
        $isOwnerOrAssignedTeacher = (
            $user->id === $course->created_by ||
            $user->id === $course->teacher_id
        );
        
        /// Check permisison
        if (!$isOwnerOrAssignedTeacher && !$user->hasAnyRole(['admin','super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'You are not authorised to delete this course.',
            ], 403);
        }

        $course->deleted_by = Auth::id();
        $course->save();

        $course->delete();

        return response()->json([
            'status' => true,
            'message' => 'Course deleted successfully'
        ]);
    }

    /**
     * Deleted courses (soft deleted - trashed )
     */
    public function deletedCourses()
    {
        $courses = Course::onlyTrashed()->with(['thumbnail', 'teacher','deletedBy', 'creator', 'category', 'subcategory','modules','lessons.module'])->get();

        return response()->json([
            'status' => true,
            'courses' => $courses->map(fn ($course) => $this->formatCourseResponse($course))
        ], 200);
    }

    /**
     * Restore courses (soft deleted - restore)
     */
    public function restoreCourse($id)
    {
        $course = Course::onlyTrashed()->find($id);

        if (!$course) {
            return response()->json([
                'status' => false,
                'message' => 'Course not found or already restored'
            ], 404);
        }

        $course->restore();

        $course -> deleted_by = null;
        $course -> save();


        return response()->json([
            'status' => true,
            'message' => 'Course restored successfully',
            'course' => $this->formatCourseResponse($course->load(['thumbnail', 'teacher', 'creator', 'category', 'subcategory', 'modules','lessons.module']))
        ], 200);
    }

    /**
     * Permanently Delete courses
     */
    public function forceDeleteCourse($id)
    {
        $course = Course::onlyTrashed()->find($id);

        $user = Auth::user();

        if (!$course) {
            return response()->json([
                'status' => false,
                'message' => 'Course not found or already permanently deleted'
            ], 404);
        }
        
        // Allow either creator OR assigned teacher
        $isOwnerOrAssignedTeacher = (
            $user->id === $course->created_by ||
            $user->id === $course->teacher_id
        );
        
        /// Check permisison
        if (!$isOwnerOrAssignedTeacher && !$user->hasAnyRole(['admin', 'super_admin'])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized to edit this course',
            ], 403);
        }


        // if course has a thumbnail in media, delete it as well

            if ($course->thumbnail_id) {
                $media = Media::find($course->thumbnail_id);
                if ($media) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $media->url));
                    $media->forceDelete();
            }
        }

        $course->forceDelete();

        return response()->json([
            'status' => true,
            'message' => 'Course permanently deleted'
        ], 200);
    }



    /**
     * Helper: format response with English + Hindi fields
     */
    private function formatCourseResponse(Course $course)
    {
        return [


            'id' => $course->id,

            'title' => [
                'en' => $course->title,
                'hi' => $course->translateField('title', 'hi') ?? $course->title,
            ],

            'description' => [
                'en' => $course->description,
                'hi' => $course->translateField('description', 'hi') ?? $course->description,
            ],

            'highlights' => [
                'en' => $course->highlights ?? [],
                'hi' => $course->translateField('highlights', 'hi')
                        ?? $course->highlights
                        ?? [],
            ],

            'language' => $course->language,
            'difficulty_level' => $course->difficulty_level,

            'price' => $course->price,
            'status' => $course->status,
            'published_at' => $course->published_at,
            'thumbnail' => $course->thumbnail_url,
            
            // Category
            'category' => $course->category ? [
                'id'   => $course->category->id,

                'name' => [
                    'en' => $course->category->name,
                    'hi' => $course->category->translateField('name','hi') ?? $course->category->name,
                    ],
            ] : null,

            // Subcategory
            'subcategory' => $course->subcategory ? [
                'id'   => $course->subcategory->id,

                'name' => [
                    'en' => $course->subcategory->name,
                    'hi' => $course->subcategory->translateField('name','hi') ?? $course->subcategory->name,
                ],
            ] : null,

            'teacher' => $course->teacher,
            'creator' => $course->creator,
            'created_at' => $course->created_at,
            'updated_at' => $course->updated_at,
            
            'deleted_by' => $course->deletedBy ? [
                'id' => $course->deletedBy->id,
                'name' => $course->deletedBy->name,
            ] : null,

            'deleted_at' => $course->deleted_at,
               
            'lessons_count' =>$course->lessons_count ?? $course->lessons->count(),

            // Modules 
            'modules' => $course->modules->map(function ($module) {

                $moduleLessons = $module->lessons;

                return [
                    'id' => $module->id,

                    'title' => [
                        'en' => $module->title,
                        'hi' => $module->translateField('title', 'hi')
                            ?? $module->title,
                    ],

                    'order' => $module->order,

                    'lessons_count' => $moduleLessons->count(),

                    'lessons' => $moduleLessons->map(function ($lesson) {
                        return [
                            'id' => $lesson->id,

                            'title' => [
                                'en' => $lesson->title,
                                'hi' => $lesson->translateField('title', 'hi')
                                    ?? $lesson->title,
                            ],

                            'order' => $lesson->order,

                            'status' => $lesson->status,
                        ];
                    })->values(),
                ];
        }),
            // Lessons

            'lessons' => $course->lessons->map(function ($lesson) {

            $module = $lesson->module;
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

                    'module' => [
                        'id' => $module?->id,
                        'title' => [
                            'en' => $module?->title ?? 'General',
                            'hi' => $module?->translateField('title', 'hi')
                                ?? $module?->title
                                ?? 'General',
                        ],
                    ],

                    // Map lesson media files as materials
                    'materials'       => $lesson->media->map(fn ($file) => [
                        'id'   => $file->id,
                        'url'  => asset('storage/' . $file->url),
                        'name' => $file->original_name ?? basename($file->url),
                    ]),
                ];
            }),     
        ];
    }

    /**
     * Helper card for Similar Courses
     */
    private function formatCourseCard(Course $course)
    {
        return [
            'id' => $course->id,

            'title' => [
                'en' => $course->title,
                'hi' => $course->translateField('title','hi') ?? $course->title,
            ],

            'price' => $course->price,

            'thumbnail' => $course->thumbnail_url,

            'lessons_count' => $course->lessons_count,

            'teacher' => $course->teacher,

            'category' => [
                'id' => $course->category?->id,
                'name' => [
                    'en' => $course->category?->name,
                    'hi' => $course->category?->translateField('name','hi')
                            ?? $course->category?->name,
                ]
            ]
        ];
    }
}
