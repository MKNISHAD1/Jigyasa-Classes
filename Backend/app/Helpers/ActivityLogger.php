<?php

namespace App\Helpers;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Auth;
use Throwable;

class ActivityLogger
{
    public static function log(
        string $action,
        ?User $targetUser = null,
        array $extra = [],
        ?string $actorType = null
    ): void {
        $actor = Auth::user();

        // Get the actor's actual Spatie role.
        $rolePrefix = strtoupper(
            $actor?->getRoleNames()->first() 
                        ?? $actorType 
                        ?? 'SYSTEM'
        );

        try {
            UserActivity::create([
                'user_id' => $actor?->id,
                'action' => "{$rolePrefix}_{$action}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_user_id' => $targetUser?->id,
                'target_user_email' => $targetUser?->email,
                'target_user_username' => $targetUser?->username,
                'extra' => $extra ?: null,
            ]);
        } catch (Throwable $e) {
            // Audit logging must not interrupt the main operation.
            report($e);
        }
    }
}