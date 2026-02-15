<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorCodeMail;
use App\Mail\AccountSuspendedMail;
use App\Mail\AccountUnsuspendedMail;
use App\Helpers\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;


class AuthenticationController extends Controller
{
    //For Login with 2FA + suspension Check
    public function authenticate(Request $request){
        //check validation
        $validator = Validator::make($request->all(),[
            'email' => 'required|email', // it will validate the email is valid or not
            'password' => 'required',// it will validate password
        ]);

        // it will return error message
       if ($validator-> fails()) {
            return response()->json([
                'status' =>false,
                'errors' => $validator->errors()
            ]);
        } 

        // Exclude soft-deleted users properly
        $user = User::where('email', $request->email)
            ->whereNull('deleted_at')
            ->first();


        // If user not found OR soft-deleted
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Your account has been deleted or does not exist. Please contact support.'
            ], 403);
        }

        // Check if user is suspended
        if ($user && $user->is_suspended) {
            if ($user->suspended_until && now()->lessThan($user->suspended_until)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Your account is suspended until ' . $user->suspended_until->toDateTimeString(),
                    'suspension_reason' => $user->suspension_reason ?? 'No reason provided',
                ], 403);
            }

        // Auto unsuspend if time passed
        if ($user->suspended_until && now()->greaterThanOrEqualTo($user->suspended_until)) {
            $user->update([
                'is_suspended' => false,
                'suspended_until' => null,
                'suspension_reason' => null,
            ]);
            
            Mail::to($user->email)->send(new AccountUnsuspendedMail($user,'auto'));

            ActivityLogger::log('Account_Auto_Unsuspended',null, [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }
        // Check Short Cooldown First
        if ($response = $this->checkTooManyFailedAttempts($request)) {
            // log lockout
            ActivityLogger::log('Account_Locked',null, ['email' => $request->email]);
            return $response; // return JSON response directly
        }

            // if validation true then it will store email and password in credential and generate token
            $credentials = $request->only('email', 'password');

            if(Auth::attempt($credentials)){
                $user = Auth::user(); // ✅ Get authenticated user first

                // Reset 2FA verification status on fresh login
                $user->update([
                    'two_factor_verified_at' => null,
                ]);

                $this->clearFailedAttempts($request); // reset attempt counter
                
                ActivityLogger::log('Login_Attempt',null, ['email' => $user->email]);


            // $user = User::find(Auth::user()->id);

                // Check if user role requires 2FA
                // if(true){ // for testing
                if($user->hasAnyRole(['admin', 'moderator','super_admin'])) { // for all highlevel users 2FA
                // if($user->hasAnyRole(['super_admin'])) { // for testing only with genuine mail
                    $otp = rand(100000, 999999);// Generate 6 Digit random OTP
                    $user->two_factor_code = Hash::make($otp);
                    $user->two_factor_expires_at = Carbon::now()->addMinutes(config('securitytimer.otp_expiry_minutes'));
                    $user->save();

            // send OTP via email
            \Mail::to($user->email)->send(new TwoFactorCodeMail($otp));

            // OTP send for 2FA
            ActivityLogger::log('2FA_OTP_Sent',null, ['email' => $user->email]);


            return response()->json([
                'status' => true,
                'two_factor' => true,
                'email' => $user->email, 
                'message' => 'OTP Successfully sent to your email'
            ]);
        }
                // Generate Token and login success (normal users)
                $token = $user -> createToken('token')->plainTextToken;
                ActivityLogger::log('Login_Success',null, ['email' => $user->email]);


                return response()->json([
                    'status' => true,
                    'token'  => $token,
                    'id'     => Auth::id(),
                    'user'   => $user->append([
                        'profile_pic'])->toArray() + [
                        'roles' => $user->getRoleNames()->toArray()] ,
                    ]);

            } 

                // failed login attempt                
                $this->incrementFailedAttempts($request);// increase failed counter
                ActivityLogger::log('Login_Failed',null, [
                    'email' => $request->email,
                ]);

                // Auto Suspension check (after 10 fails in 24h)
                if ($user)
                    {
                        $failedAttempts = RateLimiter::attempts($this->dailyThrottleKey($request));
                        if ($failedAttempts >= config('securitytimer.daily_attempt_limit') && !$user->is_suspended) { // this ony send one suspend mail
                            $user->update([
                                'is_suspended' => true,
                                // 'suspended_until' => now()->addHours(24), // 1 day suspension working
                                'suspended_until' => now()->addMinutes(config('securitytimer.suspension_time')),// testing
                                'suspension_reason' => 'Too many failed login attempts',
                            ]);

                        // Automatic Suspension Mail (working)
                        // Mail::to($user->email)->send(new AccountSuspendedMail('Too many failed login attempts', now()->addHours(24)));

                        // testing with mintes
                         Mail::to($user->email)->send(new AccountSuspendedMail('Too many failed login attempts', now()->addMinutes(config('securitytimer.suspension_time'))));

                        ActivityLogger::log('Account_Auto_Suspended',null, [
                            'email' => $user->email,
                            'reason' => 'Too many failed login attempts',
                            ]);
                        }
                    }


                // It will display error message 
                return response()->json([
                    'status'=>false,
                    'message' => 'Incorrect Email/Password, Please try Again'
                ]);            
            }

    //logging out the user
    public function logout()
    {
        $user = Auth::user(); // get full user model
        ActivityLogger::log('Logout',null, [
            'email' => $user->email,
        ]);

        $user->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Log Out Successfully , See You Soon !!!!!!!'
        ]);
    }


    // 2 Factor Autheticatio based OTP verification
    public function otpverify (Request $request)
    {
      $request->validate([
        'email' => 'required|email',
        'otp' => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
        ActivityLogger::log('2FA_Failed_Invalid_User',null, ['email' => $request->email]);
            return response()->json([
                'status' => false,
                'message' => 'User not found',
            ], 404);
        }

        // No pending 2FA
        if (! $user->two_factor_code || ! $user->two_factor_expires_at) {
            ActivityLogger::log('2FA_Failed_No_Pending_OTP',null, ['email' => $user->email]);
            return response()->json([
                'status' => false, 
                'message' => 'No pending 2FA verification'
            ], 400);
        }


        // Case 1: OTP expired
        if (now()->greaterThan($user->two_factor_expires_at)) {
            $user->update([
                'two_factor_code' => null,
                'two_factor_expires_at' => null,
            ]);

        $this->incrementFailedAttempts($request);

        ActivityLogger::log('2FA_Failed_Expired_OTP',null, ['email' => $user->email]);

        return response()->json([
            'status'  => false,
            'message' => 'OTP has expired',
        ], 401);
    }

        // Case 2: OTP Invalid
        if (!\Hash::check($request->otp, $user->two_factor_code)) {
            $this->incrementFailedAttempts($request);// increase Failed Counter
            ActivityLogger::log('2FA_Failed_Invalid_OTP',null, ['email' => $user->email]);

        return response()->json([
            'status'  => false,
            'message' => 'Invalid OTP',
        ], 401);
    }


        // Clear OTP after successful verification
        $this->clearFailedAttempts($request); // reset attempt counter
        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
            'two_factor_verified_at' => now(), // It will fill data in 2FA varify column
        ]);

        // Issue token
        $token = $user->createToken('token')->plainTextToken;

        ActivityLogger::log('2FA_Verified',null, ['email' => $user->email]);


    
        return response()->json([
            'status' => true,
            'token'  => $token,
            'message' => '2FA Otp Verified Successfully, Welcome to Dashboard',
            'user'   => $user->append([
                'profile_pic'])->toArray() + [
                'roles' => $user->getRoleNames()->toArray()],
            ]);
        }


    protected function incrementFailedAttempts(Request $request)
    {
        // Short cooldown (1 minute window)
        RateLimiter::hit($this->throttleKey($request), config('securitytimer.short_cooldown_seconds')); // lockout period: 60 seconds

        // Long-term counter (24h window)
        RateLimiter::hit($this->dailyThrottleKey($request), 60 * 60 * 24);

    }

    protected function throttleKey(Request $request)
    {
        return Str::lower($request->input('email')) . '|' . $request->ip();
    }

    protected function dailyThrottleKey(Request $request)
    {
        return 'daily:' . Str::lower($request->input('email'));
    }

    // Check short cooldown (5 attempts in 1 min)
    protected function checkTooManyFailedAttempts(Request $request)
    {
    if (RateLimiter::tooManyAttempts($this->throttleKey($request), config('securitytimer.short_cooldown_attempts'))) {
        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        return response()->json([
            'status' => false,
            'errors' => [
                'email' => ["Too many login attempts. Try again in {$seconds} seconds."]
                ]
            ],429);
        }
    }

    // Clear throttle memory
    protected function clearFailedAttempts(Request $request)
    {
        RateLimiter::clear($this->throttleKey($request));
        RateLimiter::clear($this->dailyThrottleKey($request));
    }
    

}