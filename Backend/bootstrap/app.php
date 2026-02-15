<?php

use App\Models\User;
use App\Models\Lesson;
use App\Models\Course;
use Illuminate\Foundation\Application;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        $middleware->alias([
        /// Spati Package for Roles and Permission Management  
        'role' => Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,

        // Custom middleware aliases
        'checkrolehierarchy' => \App\Http\Middleware\CheckRoleHierarchy::class,
        'checksuspensionauthority' => \App\Http\Middleware\CheckSuspensionAuthority::class,
        'log.superadmin.actions' => \App\Http\Middleware\LogSuperAdminActions::class,

        
        // Verify 2FA session 
        '2fa' => \App\Http\Middleware\TwoFactorVerified::class,

        // CheckSuspended User 
        'suspenduser' => \App\Http\Middleware\CheckSuspended::class,
        ]);
        
    })

    ->withSchedule(function (Schedule $schedule) {
        // Cleanup expired OTPs every minutes
        $schedule->call(function () {
            User::whereNotNull('two_factor_code')
                ->where('two_factor_expires_at', '<', now())
                ->update([
                    'two_factor_code' => null,
                    'two_factor_expires_at' => null
                ]);
        })->everyMinute();

        // ✅ Auto-unsuspend expired users
        $schedule->call(function () {
            $expiredUsers = User::where('is_suspended', true)
                ->whereNotNull('suspended_until')
                ->where('suspended_until', '<=', now())
                ->get();

            foreach ($expiredUsers as $user) {
                $user->update([
                    'is_suspended' => false,
                    'suspended_until' => null,
                    'suspension_reason' => null,
                ]);

            // send auto unsuspension mail
            \Mail::to($user->email)->send(new \App\Mail\AccountUnsuspendedMail($user,'auto'));

            // log activity
            \App\Helpers\ActivityLogger::log('Lift_Suspension_Automatically', $user, [
                'via' => 'scheduler'
            ]);
        }
    })->everyMinute(); // check every minute

    
        // -----------------------------
        // Auto-purge deleted lessons (>30 days)
        // -----------------------------
        $schedule->call(function () {
            $trashed = Lesson::onlyTrashed()
                ->where('deleted_at', '<', now()->subDays(30))
                ->get();

            foreach ($trashed as $lesson) {
                $lesson->forceDelete(); // triggers model events ✅
            }

            \Log::info("Auto-purged {$trashed->count()} deleted lessons older than 30 days.");
        })->dailyAt('02:00');// RUN ONCE DAILY AT 2:00 AM
        
        // -----------------------------
        // Auto-purge deleted courses (>30 days)
        // -----------------------------
        $schedule->call(function () {
            $count = Course::onlyTrashed()
                ->where('deleted_at', '<', now()->subDays(30))
                ->forceDelete();

            if($count) {
                \Log::info("Auto-purged {$count} deleted courses older than 30 days.");
            }
        })->dailyAt('03:00'); // run once daily at 3 AM

    })



    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
