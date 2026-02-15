<?php

namespace App\Helpers;

use App\Models\UserActivity;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ActivityLogger
{
    public static function log(string $action, ?User $targetUser = null, array $extra = []): void
    {
        //fetxh autheticated user
        $actor = Auth::user();

        // Fetch actor role (e.g. admin, moderator, teacher, user, system)
        $rolePrefix = strtoupper($actor?->role ?? 'SYSTEM'); 

        UserActivity::create([
            // 'user_id'    => Auth::id(), // my code
            'user_id'    => $actor?->id,
            'action'     => "{$rolePrefix}_{$action}",   // 👈 Auto prepend role
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'target_user_id' => $targetUser?->id,
            'target_user_email' => $targetUser?->email,
            'target_user_username' => $targetUser?->username,
            'extra' => $extra ?: null, // rely on $casts
        ]);
    }
}