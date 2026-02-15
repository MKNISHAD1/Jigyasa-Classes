<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Helpers\ActivityLogger;
use App\Mail\AccountUnsuspendedMail;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class CheckSuspended
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If suspended until is set and still in the future
        if ($user && $user->is_suspended) {
            if ($user->suspended_until && Carbon::now()->lessThan($user->suspended_until)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Your account is suspended.',
                    'suspended_until' => Carbon::parse($user->suspended_until)->format('d M Y h:i A'),
                    'suspension_reason' => $user->suspension_reason ?? 'No reason provided'
                ], 403);
            }

            // if Suspension Expired → Auto Unsuspend
            if ($user->suspended_until && Carbon::now()->greaterThanOrEqualTo($user->suspended_until)) {
                $user->update([
                    'is_suspended' => false,
                    'suspended_until' => null,
                    'suspension_reason' => null,
                ]);

                // send auto unsuspension mail
                Mail::to($user->email)->send(new AccountUnsuspendedMail($user,'auto'));
                
                // Logging automatic suspension
                ActivityLogger::log('Lift_Suspension_Automatically',$user, [
                    ['via' => 'middleware']
                ]);
            }
        }
            return $next($request);
    }
}
