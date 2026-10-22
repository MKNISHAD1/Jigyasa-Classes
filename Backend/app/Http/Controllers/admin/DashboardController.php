<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\UserActivity;
use App\Helpers\ActivityPresenter;


class DashboardController extends Controller
{
    public function teacherDashboard(Request $request)
    {
        $teacherId = $request->user()->id;

        /*
        |--------------------------------------------------------------------------
        | 1. Base Queries
        |--------------------------------------------------------------------------
        */

        $teacherCourses = Course::query()
            ->where('teacher_id', $teacherId);

        $teacherLessons = Lesson::query()
            ->whereHas('course', function ($query) use ($teacherId) {
                $query->withTrashed()
                    ->where('teacher_id', $teacherId);
            });

        /*
        |--------------------------------------------------------------------------
        | 2. Dashboard Statistics
        |--------------------------------------------------------------------------
        */

        $stats = [
            'total_courses' => (clone $teacherCourses)->count(),

            'total_lessons' => (clone $teacherLessons)->count(),

            'new_courses' => (clone $teacherCourses)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),

            'new_lessons' => (clone $teacherLessons)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),

            'trashed_courses' => Course::onlyTrashed()
                ->where('teacher_id', $teacherId)
                ->count(),

            'trashed_lessons' => (clone $teacherLessons)
                ->onlyTrashed()
                ->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | 3. Recent Courses (Latest 5)
        |--------------------------------------------------------------------------
        */

        $recentCourses = Course::withTrashed()
            ->with('thumbnail')
            ->withCount([
                'lessons' => function ($query) {
                    $query->withTrashed();
                },
            ])
            ->where('teacher_id', $teacherId)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,

                    'title' => [
                        'en' => $course->title,
                        'hi' => $course->translateField('title', 'hi')
                            ?? $course->title,
                    ],

                    'thumbnail' => $course->thumbnail_url,

                    'lessons_count' => $course->lessons_count,

                    // Enrollment relationship not verified yet.
                    'students_count' => null,

                    'difficulty_level' => $course->difficulty_level,

                    'status' => $course->trashed()
                        ? 'trashed'
                        : $course->status,

                    'created_at' => $course->created_at,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | 4. Recent Lessons (Latest 5)
        |--------------------------------------------------------------------------
        */

        $recentLessons = Lesson::query()
            ->select([
                'id',
                'course_id',
                'title',
                'status',
                'created_at',
                'deleted_at',
            ])
            ->with([
                'course' => function ($query) {
                    $query->withTrashed()
                        ->select([
                            'id',
                            'title',
                        ]);
                },
            ])
            ->whereHas('course', function ($query) use ($teacherId) {
                $query->withTrashed()
                    ->where('teacher_id', $teacherId);
            })
            ->withTrashed()
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($lesson) {
                $course = $lesson->course;

                return [
                    'id' => $lesson->id,

                    'title' => [
                        'en' => $lesson->title,
                        'hi' => $lesson->translateField('title', 'hi')
                            ?? $lesson->title,
                    ],

                    'course' => [
                        'id' => $course?->id,

                        'title' => [
                            'en' => $course?->title,
                            'hi' => $course
                                ? (
                                    $course->translateField('title', 'hi')
                                    ?? $course->title
                                )
                                : null,
                        ],
                    ],

                    'status' => $lesson->trashed()
                        ? 'trashed'
                        : $lesson->status,

                    'created_at' => $lesson->created_at,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | 5. Dashboard Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'status' => true,

            'stats' => $stats,

            'recent_courses' => $recentCourses,

            'recent_lessons' => $recentLessons,
        ]);
    }

    public function adminDashboard(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Base Queries
        |--------------------------------------------------------------------------
        */

        $users = User::query();

        $courses = Course::query();

        $lessons = Lesson::query();

        $thisMonth = now()->startOfMonth();

        $userLimit = max(1, min($request->integer('users_limit', 10), 50));
        $courseLimit = max(1, min($request->integer('courses_limit', 5), 50));
        $lessonLimit = max(1, min($request->integer('lessons_limit', 10), 50));


        
        /*
        |--------------------------------------------------------------------------
        | 2. User Statistics
        |--------------------------------------------------------------------------
        */
        
        // $userStats = [
        //     'total_users' => (clone $users)->count(),

        //     'students' => (clone $users)
        //         ->role('student')
        //         ->count(),

        //     'teachers' => (clone $users)
        //         ->role('teacher')
        //         ->count(),

        //     'moderators' => (clone $users)
        //         ->role('moderator')
        //         ->count(),

        //     'admins' => (clone $users)
        //         ->role('admin')
        //         ->count(),

        //     'super_admins' => (clone $users)
        //         ->role('super_admin')
        //         ->count(),

        //     'new_users' => (clone $users)
        //         ->where('created_at', '>=', $thisMonth)
        //         ->count(),

        //     'trashed_users' => User::onlyTrashed()->count(),
        // ];

        $rolePriority = [
            'super_admin',
            'admin',
            'moderator',
            'teacher',
            'student',
        ];

        $activeUsers = (clone $users)->with('roles')->get();

        $primaryRoleCounts = array_fill_keys($rolePriority, 0);

        foreach ($activeUsers as $user) {
            $userRoles = $user->getRoleNames()->all();

            foreach ($rolePriority as $role) {
                if (in_array($role, $userRoles, true)) {
                    $primaryRoleCounts[$role]++;
                    break;
                }
            }
        }

        $userStats = [
            'total_users' => $activeUsers->count(),

            'students' => $primaryRoleCounts['student'],
            'teachers' => $primaryRoleCounts['teacher'],
            'moderators' => $primaryRoleCounts['moderator'],
            'admins' => $primaryRoleCounts['admin'],
            'super_admins' => $primaryRoleCounts['super_admin'],

            'new_users' => (clone $users)
                ->where('created_at', '>=', $thisMonth)
                ->count(),

            'trashed_users' => User::onlyTrashed()->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | 3. Course Statistics
        |--------------------------------------------------------------------------
        */

        $courseStats = [
            'total_courses' => (clone $courses)->count(),

            'published_courses' => (clone $courses)
                ->where('status', 'published')
                ->count(),

            'draft_courses' => (clone $courses)
                ->where('status', 'draft')
                ->count(),

            'new_courses' => (clone $courses)
                ->where('created_at', '>=', $thisMonth)
                ->count(),

            'trashed_courses' => Course::onlyTrashed()->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | 4. Lesson Statistics
        |--------------------------------------------------------------------------
        */

        $lessonStats = [
            'total_lessons' => (clone $lessons)->count(),

            'published_lessons' => (clone $lessons)
                ->where('status', 'published')
                ->count(),

            'draft_lessons' => (clone $lessons)
                ->where('status', 'draft')
                ->count(),

            'new_lessons' => (clone $lessons)
                ->where('created_at', '>=', $thisMonth)
                ->count(),

            'trashed_lessons' => Lesson::onlyTrashed()->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | 5. Recent Users
        |--------------------------------------------------------------------------
        */

        $recentUsers = User::query()
            ->with('roles')
            ->latest()
            ->take($userLimit)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first()
                        ?? 'unassigned',
                    'profile_pic' => $user->profile_pic,
                    'email_verified' => !is_null(
                        $user->email_verified_at
                    ),
                    'created_at' => $user->created_at,
                    'is_suspended' => $user->is_suspended,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | 6. Recent Courses
        |--------------------------------------------------------------------------
        */

        $recentCourses = Course::withTrashed()
            ->with([
                'teacher' => function ($query) {
                    $query->withTrashed()
                        ->select([
                            'id',
                            'name',
                            'profile_pic',
                        ]);
                },
            ])
            ->withCount([
                'lessons' => function ($query) {
                    $query->withTrashed();
                },
            ])
            ->latest()
            ->take($courseLimit)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,

                    'title' => [
                        'en' => $course->title,
                        'hi' => $course->translateField('title', 'hi')
                            ?? $course->title,
                    ],

                    'thumbnail' => $course->thumbnail_url,

                    'teacher' => [
                        'id' => $course->teacher?->id,
                        'name' => $course->teacher?->name,
                    ],

                    'lessons_count' => $course->lessons_count,

                    'status' => $course->trashed()
                        ? 'trashed'
                        : $course->status,

                    'difficulty_level' => $course->difficulty_level,

                    'created_at' => $course->created_at,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | 7. Recent Lessons
        |--------------------------------------------------------------------------
        */

        $recentLessons = Lesson::withTrashed()
            ->select([
                'id',
                'course_id',
                'title',
                'status',
                'created_at',
                'deleted_at',
            ])
            ->with([
                'course' => function ($query) {
                    $query->withTrashed()
                        ->select(['id', 'title']);
                },
            ])
            ->latest()
            ->take($lessonLimit)
            ->get()
            ->map(function ($lesson) {
                $course = $lesson->course;

                return [
                    'id' => $lesson->id,

                    'title' => [
                        'en' => $lesson->title,
                        'hi' => $lesson->translateField('title', 'hi')
                            ?? $lesson->title,
                    ],

                    'course' => [
                        'id' => $course?->id,

                        'title' => [
                            'en' => $course?->title,
                            'hi' => $course
                                ? (
                                    $course->translateField('title', 'hi')
                                    ?? $course->title
                                )
                                : null,
                        ],
                    ],

                    'status' => $lesson->trashed()
                        ? 'trashed'
                        : $lesson->status,

                    'created_at' => $lesson->created_at,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | 8. Dashboard Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'status' => true,

            'stats' => [
                'users' => $userStats,
                'courses' => $courseStats,
                'lessons' => $lessonStats,
            ],

            'recent_users' => $recentUsers,

            'recent_courses' => $recentCourses,

            'recent_lessons' => $recentLessons,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Super Admin Dashboard
    |--------------------------------------------------------------------------
    |
    | Currently shares the Admin dashboard data structure.
    | This endpoint is kept separate for future platform-wide analytics,
    | system monitoring, storage statistics, payments, and activity logs.
    |
    */

    public function superAdminDashboard(Request $request)
    {
        $response = $this->adminDashboard($request);

        $data = $response->getData(true);

        $activityLimit = max(1,min($request->integer('activities_limit', 10), 50));

        // Future Super Admin-only metrics can be added here.
        $data['platform_overview'] = null;
        $data['recent_activities'] = $this->getRecentActivities($activityLimit);
        $data['pending_items'] = null;

        return response()->json($data, $response->getStatusCode());
    }

    // Recent Activity helper function 
    private function getRecentActivities(int $limit = 10)
    {
        return UserActivity::query()
            ->with([
                'user' => function ($query) {
                    $query->withTrashed()
                        ->select(['id', 'name']);
                },
                'targetUser' => function ($query) {
                    $query->withTrashed()
                        ->select(['id', 'name']);
                },
            ])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn ($activity) => ActivityPresenter::format($activity))
            ->values();
    }
}