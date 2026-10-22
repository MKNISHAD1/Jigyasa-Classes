<?php

namespace App\Helpers;

use App\Models\UserActivity;
use Illuminate\Support\Str;

class ActivityPresenter
{
    public static function format(UserActivity $activity): array
    {
        $extra = $activity->extra ?? [];

        $action = strtolower($activity->action ?? '');

        $actorName = $activity->user?->name
            ?? (Str::startsWith($action, 'guest_') ? 'Guest' : 'System');


        /*
        |--------------------------------------------------------------------------
        | Registration Controller
        |--------------------------------------------------------------------------
        */

        $registrationActions = [
            'registered_user' => 'registered as a new student',
        ];

        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATION CONTROLLER
        |--------------------------------------------------------------------------
        */

        $authenticationActions = [
            'login_success' => 'logged in successfully',
            // 'login_attempt' => 'started the login process',
            'login_failed' => 'had a failed login attempt',
            'logout' => 'logged out',

            // Two-factor authentication
            '2fa_verified' => 'completed two-factor verification',
            '2fa_otp_sent' => 'requested a two-factor verification code',
            '2fa_failed_invalid_user' => 'failed two-factor verification',
            '2fa_failed_no_pending_otp' => 'attempted verification without a pending code',
            '2fa_failed_expired_otp' => 'submitted an expired verification code',
            '2fa_failed_invalid_otp' => 'submitted an invalid verification code',

            // Login protection and automatic suspension
            'account_locked' => 'triggered a login lockout',
            'account_auto_suspended' => 'was automatically suspended',
            'account_auto_unsuspended' => 'was automatically unsuspended',
        ];
        
        /*
        |--------------------------------------------------------------------------
        | USER MANAGEMENT CONTROLLER
        |--------------------------------------------------------------------------
        */

        $userManagementActions = [
            'created_user' => 'created a user',
            'updated_user' => 'updated a user',
            'soft_deleted_user' => 'moved a user to trash',
            'restored_user' => 'restored a user',
            'force_deleted_user' => 'permanently deleted a user',
            'suspended_account' => 'suspended an account',
            'lifted_suspension' => 'lifted an account suspension',
        ];

        
        /*
        |--------------------------------------------------------------------------
        | USER PROFILE CONTROLLER
        |--------------------------------------------------------------------------
        */

        $userProfileActions = [
            'updated_profile' => 'updated their profile',
            'password_changed' => 'changed their password',
            'password_reset_requested' => 'requested a password reset',
            'password_reset_email_failed' => 'could not receive a password reset email',
            'password_reset_otp_resent' => 'requested another password reset code',
            'password_reset_completed' => 'reset their password',
        ];

        /*
        |--------------------------------------------------------------------------
        | COURSE CONTROLLER
        |--------------------------------------------------------------------------
        */

        $courseActions = [
            'created_course' => 'created a course',
            'updated_course' => 'updated a course',
            'published_course' => 'published a course',
            'soft_deleted_course' => 'moved a course to trash',
            'restored_course' => 'restored a course',
            'force_deleted_course' => 'permanently deleted a course',
        ];

        /*
        |--------------------------------------------------------------------------
        | CATEGORY CONTROLLER
        |--------------------------------------------------------------------------
        */

        $categoryActions = [
            'created_category' => 'created a category',
            'updated_category' => 'updated a category',
            'deleted_category' => 'deleted a category',
            'created_subcategory' => 'created a subcategory',
            'updated_subcategory' => 'updated a subcategory',
            'deleted_subcategory' => 'deleted a subcategory',
        ];

        /*
        |--------------------------------------------------------------------------
        | COURSE MODULE CONTROLLER
        |--------------------------------------------------------------------------
        */

        $moduleActions = [
            'created_module' => 'created a course module',
            'updated_module' => 'updated a course module',
            'deleted_module' => 'deleted a course module',
            'restored_module' => 'restored a course module',
            'reordered_modules' => 'reordered course modules',
            'force_deleted_module' => 'permanently deleted a course module',
            'assigned_lessons_to_module' => 'assigned lessons to a course module',
            'removed_lessons_from_module' => 'removed lessons from a course module',
            'reordered_module_lessons' => 'reordered lessons within a module',
        ];

        /*
        |--------------------------------------------------------------------------
        | FAQ CONTROLLER
        |--------------------------------------------------------------------------
        */

        $faqActions = [
            'created_faq' => 'created an FAQ',
            'updated_faq' => 'updated an FAQ',
            'deleted_faq' => 'deleted an FAQ',
        ];

        /*
        |--------------------------------------------------------------------------
        | LESSON CONTROLLER
        |--------------------------------------------------------------------------
        */

        $lessonActions = [
            'created_lesson' => 'created a lesson',
            'updated_lesson' => 'updated a lesson',
            'published_lesson' => 'published a lesson',
            'soft_deleted_lesson' => 'moved a lesson to trash',
            'restored_lesson' => 'restored a lesson',
            'force_deleted_lesson' => 'permanently deleted a lesson',
        ];

        /*
        |--------------------------------------------------------------------------
        | CONTACT MESSAGE CONTROLLER
        |--------------------------------------------------------------------------
        */

        $contactMessageActions = [
            'submitted_contact_message' => 'submitted a contact message',
            'read_contact_message' => 'read a contact message',
            'closed_contact_message' => 'closed a contact message',
        ];

        /*
        |--------------------------------------------------------------------------
        | COMBINE CONTROLLER ACTIONS
        |--------------------------------------------------------------------------
        */

        $knownActions = array_merge(
            $userManagementActions,
            $authenticationActions,
            $userProfileActions,
            $courseActions,
            $moduleActions,
            $lessonActions,
            $categoryActions,
            $contactMessageActions,
            $faqActions,
            $registrationActions,
        );

        $description = 'performed an action';

        foreach ($knownActions as $suffix => $message) {
            if (Str::endsWith($action, strtolower($suffix))) {
                $description = $message;
                break;
            }
        }

        $targetName = $activity->targetUser?->name;

        // Useful fallback if the target was permanently deleted.
        $targetName ??= $extra['target_name'] ?? null;
        $targetName ??= $activity->target_user_username ?? null;

        $entityTitle = $extra['entity_title'] ?? null;
        $entityType = $extra['entity_type'] ?? null;

        $actorRole = $activity->user?->getRoleNames()->first();

        $actorType = $activity->user
            ? 'user'
            : (Str::startsWith($action, 'guest_') ? 'guest' : 'system');

        if (Str::endsWith($action, 'registered_user')) {
            $studentName = $targetName
                ?? $entityTitle
                ?? $activity->target_user_username
                ?? 'A new user';

            $message = $studentName . ' registered as a new student';
        } else {
            $message = $actorName . ' ' . $description;

            if ($targetName) {
                $message .= ': ' . $targetName;
            } elseif ($entityTitle) {
                $message .= ': ' . $entityTitle;
            }
        }

        return [
            'id' => $activity->id,
            'actor_name' => $actorName,
            'action' => $activity->action,
            'description' => $description,
            'target_name' => $targetName,
            'entity_type' => $entityType,
            'entity_title' => $entityTitle,
            'actor_role' => $actorRole,
            'actor_type' => $actorType,
            'message' => $message,
            'created_at' => $activity->created_at,
            'time_ago' => $activity->created_at?->diffForHumans(),
        ];
    }
}