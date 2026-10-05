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
        $courses = $courses->map(function ($course) {

            return $this->formatCourse($course, [
                'description',
                'highlights',
                'language',
                'difficulty_level',
                'status',
                'published_at',
                'creator',
                'subcategory',
                'created_at',
                'updated_at',
            ]);

        });

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
            'category',
            'subcategory'
        ])
        ->withCount('lessons')
        ->withSum('lessons as total_duration', 'duration')
        ->where('status', 'published')
        ->latest()
        ->get();

        return response()->json([
            'status' => true,
            'courses' => $courses->map(function ($course) {
                return $this->formatCourse($course, [
                    'subcategory','status','difficulty_level','created_at'
                ]);
            }),
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
            'modules.lessons',
        ])
        ->withCount('lessons')
        ->withSum('lessons as total_duration', 'duration')
        ->findOrFail($id);

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

            'course' => $this->formatCourse($course, [
                'description',
                'highlights',
                'language',
                'difficulty_level',
                'status',
                'published_at',
                'creator',
                'subcategory',
                'created_at',
                'updated_at',
                'modules',
                'lessons',
            ]),

            'similar_courses' => $similarCourses->map(function ($item) {

                return $this->formatCourse($item, [
                    'subcategory',
                ]);

            }),
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
            'course' => $this->formatCourse(
                $course->load([
                    'thumbnail',
                    'teacher',
                    'creator',
                    'category',
                    'subcategory'
                ]),
                [
                    'description',
                    'highlights',
                    'language',
                    'difficulty_level',
                    'status',
                    'published_at',
                    'creator',
                    'subcategory',
                    'created_at',
                    'updated_at',
                ]
            )
        ], 201);
    }

    /**
     * Show a specific course with lessons
     */
    public function viewCourse($id)
    {
        $course = Course::with([
            'lessons.module',
            'modules.lessons',
            'thumbnail',
            'teacher',
            'creator',
            'category',
            'subcategory',
        ])
        ->withCount('lessons')
        ->findOrFail($id);

        return response()->json([
            'status' => true,

            'course' => $this->formatCourse($course, [
                'description',
                'highlights',
                'language',
                'difficulty_level',
                'status',
                'published_at',
                'creator',
                'subcategory',
                'created_at',
                'updated_at',
                'deleted_by',
                'deleted_at',
                'modules',
                'lessons',
            ]),
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

                'teacher_id' => $request->teacher_id ?? $course->teacher_id,
                'language' =>  $request->language ?? $course->language,
                'difficulty_level' => $request->difficulty_level ?? $course->difficulty_level,
                'highlights' => $request->highlights ?? $course->highlights,
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
            'status' => true,
            'message' => 'Course updated successfully',
            'course' => $this->formatCourse(
                $course->load([
                    'thumbnail',
                    'teacher',
                    'creator',
                    'category',
                    'subcategory',
                ]),
                [
                    'description',
                    'highlights',
                    'language',
                    'difficulty_level',
                    'status',
                    'published_at',
                    'creator',
                    'subcategory',
                    'created_at',
                    'updated_at',
                    'deleted_by',
                    'deleted_at',
                ]
            ),
        ]);

    }

    /**
     * Fetch the courses
     * - Moderator/Admin/SuperAdmin can see all courses
     * - Teacher can see only created by him and assigned to him
     */
    public function getMyCourses(Request $request)
    {
        $user = Auth::user();

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

        $courses = Course::with([
            'teacher',
            'creator',
            'category',
            'subcategory',
            'thumbnail',
        ])
        ->withCount('lessons')
        ->where(function ($query) use ($user) {
            $query->where('created_by', $user->id)
                ->orWhere('teacher_id', $user->id);
        })
        ->latest()
        ->get();

        return response()->json([
            'status' => true,

            'courses' => $courses->map(function ($course) {

                return $this->formatCourse($course, [
                    'description',
                    'highlights',
                    'language',
                    'difficulty_level',
                    'status',
                    'published_at',
                    'creator',
                    'subcategory',
                    'created_at',
                    'updated_at',
                ]);

            }),
        ]);
    }

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
     * Deleted courses (soft deleted - trashed)
     */
    public function deletedCourses()
    {
        $courses = Course::onlyTrashed()
            ->with([
                'thumbnail',
                'teacher',
                'deletedBy',
                'creator',
                'category',
                'subcategory',
            ])
            ->withCount('lessons')
            ->get();

        return response()->json([
            'status' => true,

            'courses' => $courses->map(function ($course) {

                return $this->formatCourse($course, [
                    'description',
                    'highlights',
                    'language',
                    'difficulty_level',
                    'status',
                    'published_at',
                    'creator',
                    'subcategory',
                    'created_at',
                    'updated_at',
                    'deleted_by',
                    'deleted_at',
                ]);

            }),
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

        $course->deleted_by = null;
        $course->save();

        $course->load([
            'thumbnail',
            'teacher',
            'creator',
            'category',
            'subcategory',
        ]);

        $course->loadCount('lessons');

        return response()->json([
            'status' => true,

            'message' => 'Course restored successfully',

            'course' => $this->formatCourse($course, [
                'description',
                'highlights',
                'language',
                'difficulty_level',
                'status',
                'published_at',
                'creator',
                'subcategory',
                'created_at',
                'updated_at',
                'deleted_by',
                'deleted_at',
            ]),
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

    // New Formatter
    private function formatCourse(Course $course, array $options = []) 
    {
        $data = [
            'id' => $course->id,

            'title' => [
                'en' => $course->title,
                'hi' => $course->translateField('title', 'hi')
                        ?? $course->title,
            ],

            'price' => $course->price,

            'thumbnail' => $course->thumbnail_url,

            'lessons_count' => $course->lessons_count,

            'total_duration' => $course->total_duration ?? 0,

            'teacher' => $course->teacher,

            'category' => [
                'id' => $course->category?->id,
                'name' => [
                    'en' => $course->category?->name,
                    'hi' => $course->category?->translateField('name', 'hi')
                            ?? $course->category?->name,
                ],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Optional course fields
        |--------------------------------------------------------------------------
        */

        if (in_array('description', $options)) {
            $data['description'] = [
                'en' => $course->description,
                'hi' => $course->translateField('description', 'hi')
                        ?? $course->description,
            ];
        }

        if (in_array('highlights', $options)) {
            $data['highlights'] = [
                'en' => $course->highlights,
                'hi' => $course->translateField('highlights', 'hi')
                        ?? $course->highlights,
            ];
        }

        if (in_array('language', $options)) {
            $data['language'] = $course->language;
        }

        if (in_array('difficulty_level', $options)) {
            $data['difficulty_level'] = $course->difficulty_level;
        }

        if (in_array('status', $options)) {
            $data['status'] = $course->status;
        }

        if (in_array('published_at', $options)) {
            $data['published_at'] = $course->published_at;
        }

        if (in_array('creator', $options)) {
            $data['creator'] = $course->creator;
        }

        if (in_array('subcategory', $options)) {
            $data['subcategory'] = [
                'id' => $course->subcategory?->id,
                'name' => [
                    'en' => $course->subcategory?->name,
                    'hi' => $course->subcategory?->translateField('name', 'hi')
                            ?? $course->subcategory?->name,
                ],
            ];
        }

        if (in_array('created_at', $options)) {
            $data['created_at'] = $course->created_at;
        }

        if (in_array('updated_at', $options)) {
            $data['updated_at'] = $course->updated_at;
        }

        if (in_array('deleted_by', $options)) {
            $data['deleted_by'] = $course->deleted_by;
        }

        if (in_array('deleted_at', $options)) {
            $data['deleted_at'] = $course->deleted_at;
        }


        /*
        |--------------------------------------------------------------------------
        | Modules
        |--------------------------------------------------------------------------
        */

        if (in_array('modules', $options)) {
            $data['modules'] = $course->modules->map(function ($module) {

                return [
                    'id' => $module->id,

                    'title' => [
                        'en' => $module->title,
                        'hi' => $module->translateField('title', 'hi')
                                ?? $module->title,
                    ],

                    'order' => $module->order,

                    'lessons' => $module->lessons?->map(function ($lesson) {
                        return [
                            'id' => $lesson->id,

                            'title' => [
                                'en' => $lesson->title,
                                'hi' => $lesson->translateField('title', 'hi')
                                        ?? $lesson->title,
                            ],

                            'duration' => $lesson->duration,

                            'order' => $lesson->order,

                            'status' => $lesson->status,

                            'has_materials'  => $lesson->materials->isNotEmpty(),
                        ];
                    }),
                ];
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Lessons
        |--------------------------------------------------------------------------
        */

        if (in_array('lessons', $options)) {
            $data['lessons'] = $course->lessons->map(function ($lesson) {

                return [
                    'id' => $lesson->id,

                    'title' => [
                        'en' => $lesson->title,
                        'hi' => $lesson->translateField('title', 'hi')
                                ?? $lesson->title,
                    ],

                    'description' => [
                        'en' => $lesson->description,
                        'hi' => $lesson->translateField('description', 'hi')
                                ?? $lesson->description,
                    ],

                    'bunny_video_url' => $lesson->bunny_video_url,

                    'bunny_signed_url' => $lesson->signed_url,

                    'order' => $lesson->order,

                    'is_free_preview' => $lesson->is_free_preview,

                    'status' => $lesson->status,

                    'is_locked' => $lesson->is_locked,

                    'published_at' => $lesson->published_at,

                    'duration' => $lesson->duration,

                    'module' => $lesson->module ? [
                        'id' => $lesson->module->id,

                        'title' => [
                            'en' => $lesson->module->title,
                            'hi' => $lesson->module->translateField('title', 'hi')
                                    ?? $lesson->module->title,
                        ],
                    ] : null,

                    'materials' => $lesson->materials,
                ];
            });
        }

        return $data;
    }
}
