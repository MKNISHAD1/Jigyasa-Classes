<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\CategoryCantroller;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\admin\UserProfileController;
use App\Http\Controllers\admin\UserManagementController;

use App\Models\User;




/*
|--------------------------------------------------------------------------
| Public Routes (No Auth Required)/ No Login needed to visit pages
|--------------------------------------------------------------------------
*/
Route::post('login',[AuthenticationController::class,'authenticate']); // earlier link = authuser, nowlink = login
Route::post('register',[RegistrationController::class,'register']);




/*
|--------------------------------------------------------------------------
| Uniqueness checks
|--------------------------------------------------------------------------
*/
// Check email uniqueness
Route::get('/check-email', function(Request $request) {
    $email = $request->query('email');
    $id = $request->query('id'); // optional user id
    $query = User::where('email', $email);
    if ($id) {
        $query->where('id', '!=', $id);
     }
    $exists = $query->exists();
    return response()->json(['exists' => $exists]);
});

// Check username uniqueness
Route::get('/check-username', function(Request $request) {
    $username = $request->query('username');
    $id = $request->query('id'); // optional user id
    $query = User::where('username', $username);
    if ($id) {
        $query->where('id', '!=', $id);
    }
    $exists = $query->exists();
    return response()->json(['exists' => $exists]);
});




/*
|--------------------------------------------------------------------------
| Forgot / Reset password
|--------------------------------------------------------------------------
*/
// Forgt passward and reset password 
Route::post('forgot-password', [UserProfileController::class, 'forgotPassword']);
Route::post('reset-password-link', [UserProfileController::class, 'resetPasswordlink']);
Route::post('reset-password-otp', [UserProfileController::class, 'resetPasswordWithOtp']);




/*
|--------------------------------------------------------------------------
| Email verification routes
|--------------------------------------------------------------------------
*/

// 1) Handle the verification link clicked from email (no auth needed, just signed)
Route::get('verify-email/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    // Validate signature and email hash
    if (! $request->hasValidSignature()) {
        return redirect(config('app.frontend_url', env('FRONTEND_URL')).'/email-verified?status=invalid-signature');
    }
    if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
        return redirect(config('app.frontend_url', env('FRONTEND_URL')).'/email-verified?status=invalid-hash');
    }

    // Already verified?
    if ($user->hasVerifiedEmail()) {
        return redirect(config('app.frontend_url', env('FRONTEND_URL')).'/email-verified?status=already-verified');
    }

    // Mark verified
    $user->markEmailAsVerified();
    event(new Verified($user));

    return redirect(config('app.frontend_url', env('FRONTEND_URL')).'/email-verified?status=verified');
})->name('verification.verify')->middleware('signed');

// 2) Resend verification email (must be logged in but NOT verified)
Route::post('email/verification-notification', function (Request $request) {
    $user = $request->user();

    if ($user->hasVerifiedEmail()) {
        return response()->json([
            'status' => false,
            'message' => 'Email already verified.'
        ], 400);
    }

    // This uses Laravel’s built-in notification and generates a signed URL
    $user->sendEmailVerificationNotification();

    return response()->json([
        'status' => true,
        'message' => 'Verification link sent!'
    ]);
})->middleware('auth:sanctum');




/*
|--------------------------------------------------------------------------
| 2 Factor Athentication Route
|--------------------------------------------------------------------------
*/ 
Route::post('2fa-otp-verify',[AuthenticationController::class,'otpverify']);




/*
|--------------------------------------------------------------------------
| Authenticated Users (Students, Teachers, etc.)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum','suspenduser'])->group(function () 
{
    //  Get Logged in User's Data
    Route::get('user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->toArray(),
            'email_verified_at' => $user->email_verified_at,
            'is_suspended' => (bool) $user->is_suspended,
            'suspended_until' => $user->suspended_until,
            'profile_pic' => $user->profile_pic
        ]);
    });

    // dashboard and logout
    Route::get('dashurl',[DashboardController::class,'index']);
    Route::get('logout',[AuthenticationController::class,'logout']);

    // Profile routes ( self profile only)
    Route::get('viewprofile', [UserProfileController::class, 'viewProfile']);
    Route::put('updateprofile', [UserProfileController::class, 'updateProfile']);
    Route::put('changepassword', [UserProfileController::class, 'changePassword']);
    Route::get('suspension-status', [UserProfileController::class, 'suspensionStatus']);
});


/*
// ===================================================================================================
|           Admin / Moderator / Super Admin Routes   ----  All Routes having '2fa' middelware 
// ===================================================================================================
*/

// 🔹 Base users list (moderator + admin + super_admin , 2FA protected)
Route::get('get-users', [UserManagementController::class, 'alluser'])
    ->middleware(['auth:sanctum', 'role:admin|moderator|super_admin']);


// 🔹 View a single user
Route::get('view-user/{id}', [UserManagementController::class, 'viewuser'])
    ->middleware(['auth:sanctum', 'role:moderator|admin|super_admin']);

// 🔹 Create new user
Route::post('add-user', [UserManagementController::class, 'newuser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'role:moderator|admin|super_admin']);

// 🔹 Update user info
Route::put('update-user/{id}', [UserManagementController::class, 'updateuser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'role:moderator|admin|super_admin']);

// 🔹 Soft delete user
Route::delete('delete-user/{id}', [UserManagementController::class, 'deleteuser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'role:moderator|admin|super_admin']);

// 🔹 Suspended Users List 
Route::get("suspended-users-list", [UserManagementController::class, "suspendedUsersList"])
    ->middleware(['auth:sanctum', 'role:moderator|admin|super_admin']);



// ===================================================================================================
//                                       Suspension Routes
// ===================================================================================================

// 🔹 Suspend Users  
Route::post('user-suspended/{id}', [UserManagementController::class, 'suspendUser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'checksuspensionauthority', 'role:moderator|admin|super_admin']);

// 🔹 Lift Suspension From Users      
Route::post('user-unsuspended/{id}', [UserManagementController::class, 'unsuspendUser'])
    ->middleware(['auth:sanctum',  'checkrolehierarchy', 'checksuspensionauthority', 'role:moderator|admin|super_admin']);



// ===================================================================================================
//                                          Delete Users Routes
// ===================================================================================================

// 🔹 View deleted users (only admin + super_admin)
Route::get('deleted-users', [UserManagementController::class, 'trashedUsers'])
    ->middleware(['auth:sanctum',  'role:admin|super_admin']);

// 🔹 Restore deleted user (only super_admin)
Route::post('user-restore/{id}', [UserManagementController::class, 'restoreUser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'role:super_admin']);

// 🔹 Force delete users (only super_admin)
Route::delete('user-force-delete/{id}', [UserManagementController::class, 'forceDeleteUser'])
    ->middleware(['auth:sanctum', 'checkrolehierarchy', 'role:super_admin']);




// ===================================================================================================
//                                           Course Routes
// ===================================================================================================

// Public Routes
Route::get('courses', [CourseController::class, 'courseList']);

// Public Course View
Route::get('Course-View/{id}', [CourseController::class, 'publicCourseView']);


// Protected Routes (Teacher, Moderator, Admin, Super Admin) - For Course Management
Route::middleware(['auth:sanctum'])->group(function () {
    
    // List courses
    // Route::get('courses', [CourseController::class, 'courseList'])
    //     ->middleware('role:student|teacher|moderator|admin|super_admin');
    
    // Show single course (with lessons)
    Route::get('view-course/{id}', [CourseController::class, 'viewCourse'])
        ->middleware('role:student|teacher|moderator|admin|super_admin');
    
    // Create course (teacher, moderator, admin, super_admin)
    Route::post('create-course', [CourseController::class, 'createCourse'])
        ->middleware('role:teacher|moderator|admin|super_admin');
    
    // Update course (owner OR admin/super_admin)
    Route::put('update-course/{id}', [CourseController::class, 'updateCourse'])
        ->middleware('role:teacher|moderator|admin|super_admin');
    
    // Fetched the courses of assigned teacher in course
    Route::get('my-courses', [CourseController::class, 'getMyCourses'])
        ->middleware('role:teacher|moderator|admin|super_admin');
    
    // Delete course (owner OR admin/super_admin)
    Route::delete('delete-course/{id}', [CourseController::class, 'deleteCourse'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    Route::get('deletedcourses', [CourseController::class, 'deletedCourses'])
        ->middleware('role:teacher|moderator|admin|super_admin');


    Route::post('restore-course/{id}', [CourseController::class, 'restoreCourse'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    Route::delete('force-delete-course/{id}', [CourseController::class, 'forceDeleteCourse'])
        ->middleware('role:teacher|moderator|admin|super_admin');

});



// ===================================================================================================
//                                      Module Routes
// ===================================================================================================

use App\Http\Controllers\CourseModuleController;

// Protected Routes

Route::middleware(['auth:sanctum'])->group(function () {

Route::post('module', [CourseModuleController::class, 'createModule'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::put('update-module/{id}', [CourseModuleController::class, 'updateModule'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::delete('modules/bulk-delete',[CourseModuleController::class, 'bulkDeleteModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::post('modules/bulk-restore',[CourseModuleController::class, 'bulkRestoreModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::delete('modules/bulk-force-delete',[CourseModuleController::class, 'bulkForceDeleteModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');

Route::delete('modules/{id}', [CourseModuleController::class, 'deleteModule'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::get('course/{courseId}/modules', [CourseModuleController::class, 'listModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::get('deleted-modules',[CourseModuleController::class, 'trashedModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::post('restore-module/{id}',[CourseModuleController::class, 'restoreModule'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::delete('force-delete-module/{id}',[CourseModuleController::class, 'forceDeleteModule'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::post('modules/{id}/assign-lessons',[CourseModuleController::class, 'assignLessons'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::post('modules/{id}/remove-lessons',[CourseModuleController::class, 'removeLessons'])
    ->middleware('role:teacher|moderator|admin|super_admin');

    // Module reorder
Route::post('course/{courseId}/modules/reorder',[CourseModuleController::class, 'reorderModules'])
    ->middleware('role:teacher|moderator|admin|super_admin');

    // Lesson reorder
Route::get('course/{courseId}/module/{moduleId}/lessons',[CourseModuleController::class,    'getModuleLessons'])
    ->middleware('role:teacher|moderator|admin|super_admin');
Route::post('course/{courseId}/module/{moduleId}/reorder-lessons',[CourseModuleController::class, 'reorderModuleLessons'])
    ->middleware('role:teacher|moderator|admin|super_admin');
});




// ===================================================================================================
//                                      Lesson Routes
// ===================================================================================================

Route::middleware(['auth:sanctum'])->group(function () {
    
    // List lessons for a course
    Route::get('courses/{courseId}/lessons', [LessonController::class, 'lessonList'])
        ->middleware('role:student|teacher|moderator|admin|super_admin');
    
    // Show single lesson
    Route::get('courses/{courseId}/view-lesson/{id}', [LessonController::class, 'viewLesson'])
        ->middleware('role:student|teacher|moderator|admin|super_admin');
    
    // 🔒 Generate temporary signed upload URL (for Clean Lesson Upload Flow)
    Route::post('lessons/{lessonId}/generate-upload-url', [LessonController::class, 'generateSignedUploadUrl'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // Create lesson (teacher, moderator, admin, super_admin)
    Route::post('courses/{courseId}/create-lesson', [LessonController::class, 'createLesson'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // upload material after lesson video (teacher, moderator, admin, super_admin)
    Route::post('lessons/{lessonId}/upload-materials', [LessonController::class, 'uploadMaterials'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // ✅ Finalize Bunny upload and store video URL
    Route::post('lessons/{lessonId}/finalize-upload', [LessonController::class, 'finalizeUpload'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // Update lesson (owner OR admin/super_admin)
    Route::put('courses/{courseId}/update-lesson/{id}', [LessonController::class, 'updateLesson'])
        ->middleware('role:teacher|moderator|admin|super_admin');
    
    // Delete lesson (owner OR admin/super_admin)
    Route::delete('courses/{courseId}/delete-lesson/{id}', [LessonController::class, 'deleteLesson'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 📌 Bulk soft delete lessons for a course
    Route::delete('courses/{courseId}/lessons/bulk-delete', [LessonController::class, 'bulkDeleteLessons'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 📌 Bulk restore lessons for a course
    Route::post('courses/{courseId}/lessons/bulk-restore', [LessonController::class, 'bulkRestoreLessons'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 📌 Bulk soft delete lessons for a course
    Route::delete('courses/{courseId}/lessons/bulk-force-delete', [LessonController::class, 'bulkForceDeleteLessons'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 📌 List of deleted lessons of courses
    Route::get('courses/{courseId}/lessons/trashed', [LessonController::class, 'trashedLessons'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // Restore
    Route::post('courses/{courseId}/restore-lesson/{id}', [LessonController::class, 'restoreLesson'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // Force delete
    Route::delete('courses/{courseId}/force-delete-lesson/{id}', [LessonController::class, 'forceDeleteLesson'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 📂 Trashed lessons - teacher-specific
    Route::get('courses/{courseId}/lessons/trashed-by-teacher', [LessonController::class, 'trashedLessonsByUser'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // ♻ Restore lesson (teacher only for own lessons)
    Route::post('courses/{courseId}/lessons/{id}/restore-by-teacher', [LessonController::class, 'restoreLessonByUser'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // 🗑 Force delete lesson (teacher only for own lessons)
    Route::delete('courses/{courseId}/lessons/{id}/force-delete-by-teacher', [LessonController::class, 'forceDeleteLessonByUser'])
        ->middleware('role:teacher|moderator|admin|super_admin');

    // Change the order of Lessosn in Course 
    Route::post('courses/{courseId}/lesson/Reorder-Lessons', [LessonController::class, 'reorderLessons'])
        ->middleware('role:teacher|moderator|admin|super_admin');
    
    // refresh teh valid playback url after expire 
    Route::get('/lessons/{id}/refresh-url', [LessonController::class, 'refreshSignedUrl'])
        ->middleware('role:teacher|student|admin|super_admin');

    // laravel proxy upload to bunny
    Route::post('/lessons/{lesson}/proxy-upload', [LessonController::class, 'proxyUpload'])
        ->middleware('role:teacher|student|admin|super_admin');


});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('teachers', [UserManagementController::class, 'getTeachers']);
});


// ===================================================================================================
//                                      FAQ Routes
// ===================================================================================================
use App\Http\Controllers\FaqController;

// Public Route
Route::get('list-faqs', [FaqController::class, 'index']);   // list

// Protected Route
Route::middleware('auth:sanctum')->group(function () {
    Route::post('create-faqs', [FaqController::class, 'store']);  // create
    Route::put('update-faqs/{id}', [FaqController::class, 'update']); // update
    Route::delete('delete-faqs/{id}', [FaqController::class, 'destroy']); // delete
});


// ===================================================================================================
//                                      Categoty and Sub-Category Routes
// ===================================================================================================


// public Routes

Route::get('categories', [CategoryCantroller::class, 'getAllcategories']);
Route::get('categories/{id}/subcategories', [CategoryCantroller::class, 'getAllsubcategories']);

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {

    // Route::get('categories', [CategoryCantroller::class, 'getAllcategories'])
    //     ->middleware('role:teacher|admin|super_admin');
    
    // Category CRUD
    Route::post('category/create', [CategoryCantroller::class, 'createCategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::put('category/update/{id}', [CategoryCantroller::class, 'updateCategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::delete('category/delete/{id}', [CategoryCantroller::class, 'deleteCategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::get('category/get-category/{id}', [CategoryCantroller::class, 'getCategory'])
        ->middleware('role:teacher|admin|super_admin');
    
    // Route::get('categories/{id}/subcategories', [CategoryCantroller::class, 'getAllsubcategories'])
    //     ->middleware('role:teacher|admin|super_admin');
    // Subcategory CRUD
    Route::post('subcategory/create', [CategoryCantroller::class, 'createSubcategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::put('subcategory/update/{id}', [CategoryCantroller::class, 'updateSubcategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::delete('subcategory/delete/{id}', [CategoryCantroller::class, 'deleteSubcategory'])
        ->middleware('role:teacher|admin|super_admin');
    Route::get('subcategory/get-subcategory/{id}', [CategoryCantroller::class, 'getSubcategory'])
        ->middleware('role:teacher|admin|super_admin');

});


// ===================================================================================================
//                                      Translation Page Routes
// ===================================================================================================

use App\Http\Controllers\TranslationController;

// Translation admin
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('translations', [TranslationController::class, 'index'])// list / filter
        ->middleware('role:teacher|admin|super_admin'); 
    Route::get('translations/{type}/{id}', [TranslationController::class, 'show'])// show single (course|lesson)
        ->middleware('role:teacher|admin|super_admin'); 
    Route::post('translations/{type}/{id}/update', [TranslationController::class, 'update'])// human edit
        ->middleware('role:teacher|admin|super_admin'); 
    Route::post('translations/{type}/{id}/regenerate', [TranslationController::class, 'regenerate'])// force machine regenerate
        ->middleware('role:teacher|admin|super_admin'); 
    Route::post('translations/{type}/{id}/mark-done', [TranslationController::class, 'markDone'])// mark reviewed
        ->middleware('role:teacher|admin|super_admin'); 
});
