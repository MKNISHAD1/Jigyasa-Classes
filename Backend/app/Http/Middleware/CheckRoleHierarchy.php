<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleHierarchy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */


    protected $priority = [
        'super_admin' => 100,
        'admin'       => 80,
        'moderator'   => 60,
        'teacher'     => 40,
        'student'     => 20,
    ];

    protected function rolePriority($roleName)
    {
        return $this->priority[$roleName] ?? 0;
    }

    protected function highestRoleName($user)
    {
        // getRoleNames returns Collection or array of role names. Pick highest by priority.
        $roles = is_array($user->roles) ? $user->roles : $user->getRoleNames()->toArray();
        if (!$roles) return null;
        
        usort($roles, function ($a, $b) { 
            return $this->rolePriority($b) <=> $this->rolePriority($a); });
        return $roles[0] ?? null;
    }


    public function handle(Request $request, Closure $next): Response
    {

        $actor = Auth::user();
        if (!$actor) 
            return response()->json([
                'status'=>false,
                'message'=>'Unauthenticated'
            ],401);

                // Case: creating a new user (role comes from request, no targetId)
        if ($request->isMethod('post') && $request->routeIs('add-user')) {
            $actorRole = $this->highestRoleName($actor);
            $actorPriority = $this->rolePriority($actorRole);

            $newRole = $request->input('role');
            $newRolePriority = $this->rolePriority($newRole);

        if ($newRolePriority >= $actorPriority) {
            return response()->json([
                'status' => false,
                'message' => "You cannot create a user with equal or higher role than yours"
            ], 403);
        }
        return $next($request); // ✅ important, allow if valid
    }

                // --- Normal target user flow ---
        // try to find target user id from route param 'id'
        $targetId = $request->route('id') ?? $request->input('id') ?? null;
        if (!$targetId) return $next($request); // middleware not applicable if no target.

        $target = User::with('roles')->withTrashed()->find($targetId);  // fetch both active and soft deleted
        if (!$target) 
            return response()->json([
                'status'=>false,
                'message'=>'Target user not found'
            ],404);

        // Same user editing self is allowed
        if ($actor->id === $target->id) return $next($request);

        $actorRole = $this->highestRoleName($actor);
        $targetRole = $this->highestRoleName($target);

        $actorPriority = $this->rolePriority($actorRole);
        $targetPriority = $this->rolePriority($targetRole);

        // If actor has lower priority -> deny
        if ($actorPriority < $targetPriority) {
            return response()->json([
                'status'=>false,
                'message'=>'You cannot act on a user with higher role'
            ],403);
        }

        // Peer immunity: same priority (e.g., admin on admin) but not same id -> deny
        if ($actorPriority === $targetPriority) {
            return response()->json([
                'status'=>false,
                'message'=>'You cannot act on a user of equal role (peer immunity)'
            ],403);
        }

        return $next($request);
    }
}
