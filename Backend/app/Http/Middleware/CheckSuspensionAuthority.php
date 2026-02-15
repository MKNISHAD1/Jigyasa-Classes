<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSuspensionAuthority
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
        $roles = is_array($user->roles) ? $user->roles : $user->getRoleNames()->toArray();
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

        $targetId = $request->route('id') ?? $request->input('id');
        if (!$targetId) 
            return response()->json([
                'status'=>false,
                'message'=>'Missing target id'
            ],400);

        $target = User::find($targetId);
        if (!$target) 
            return response()->json([
                'status'=>false,
                'message'=>'Target user not found'
            ],404);

        // If no suspension exists yet (this middleware might be used on unsuspend route),
        // but principal logic is for lifting suspension:
        $suspenderId = $target->suspension_by;
        if (!$suspenderId) {
            // nothing to check, allow (or you may choose to block)
            return $next($request);
        }
        
        $suspender = User::find($suspenderId);
        // If unknown suspender, be conservative and block unless actor is super_admin
        $suspenderRole = $suspender ? $this->highestRoleName($suspender) : null;
        $actorRole = $this->highestRoleName($actor);

        // rule 1: only super_admin can lift suspension applied by super_admin
        if ($suspenderRole === 'super_admin' && $actorRole !== 'super_admin') {
            return response()->json([
                'status'=>false,
                'message'=>'Only super admin can lift suspensions made by super admin'
            ],403);
        }

        // rule 2: admin can't lift suspension made by another admin
        if ($suspenderRole === 'admin' && $actorRole === 'admin' && $actor->id !== $suspenderId) {
            return response()->json([
                'status'=>false,
                'message'=>'Admins cannot lift suspensions placed by other admins'
            ],403);
        }

        // general rule: allow lift only if actor priority > suspender priority OR actor is the suspender
        $actorPriority = $this->rolePriority($actorRole);
        $suspenderPriority = $this->rolePriority($suspenderRole);

        if ($actor->id === $suspenderId) {
            return $next($request); // suspender can lift their own suspension
        }

        if ($actorPriority <= $suspenderPriority) {
            return response()->json([
                'status'=>false,
                'message'=>'You do not have authority to lift this suspension'
            ],403);
        }



        return $next($request);
    }
}
