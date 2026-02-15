<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogSuperAdminActions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $actor = Auth::user();
        $targetId = $request->route('id') ?? $request->input('id');
        if ($actor && $targetId) {
            $target = User::with('roles')->find($targetId);
            if ($target) {
                $targetRoleNames = $target->getRoleNames()->toArray();
                if (in_array('admin', $targetRoleNames) || in_array('moderator', $targetRoleNames)) {
                    ActivityLogger::log('Superadmin_Action_Warning', $actor, [
                        'action_uri' => $request->path(),
                        'target_user_id' => $target->id,
                        'target_roles' => $targetRoleNames,
                    ]);
                }
            }
        }

        return $next($request);
    }
}
