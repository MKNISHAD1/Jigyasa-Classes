<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if($user && $user->hasRole(['admin','moderator','superadmin']))
            {
                if ($user && !$user->two_factor_verified_at) {
                return response()->json([
                    'status' => false,
                    'message' => 'Two factor authentication required'
                ], 403);
            }
        }

        
        return $next($request);
        
    }
}
