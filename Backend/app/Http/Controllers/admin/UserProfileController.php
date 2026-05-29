<?php

namespace App\Http\Controllers\admin;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Media;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        THIS CONTROLLER FOR STUDENTS  AND TEACHERS ONLY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class UserProfileController extends Controller
{
    // Get logged in user profile data
    public function viewProfile(Request $request)
    {
        $user = Auth::user()->load('roles'); // load roles

        $profilePic = $user->media()->where('type', 'profile_pic')->first();

        // $user->profile_pic = $profilePic
        //     ? asset($profilePic->url)
        //     : asset('uploads/profiles/default/' . $user->role . '.png');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'mobile_no' => $user->mobile_no,
                'address' => $user->address,
                'profile_pic' => $user->profile_pic, // Accessor handle media or roll back , no need of above code block
                'email_verified_at' => $user->email_verified_at,
                'role' => $user->getRoleNames(), //fetch roleform spatie
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'professional_title' => $user->professional_title,
                'bio' => $user->bio,
                'social_links' => $user->social_links,
            ]
        ]);
    }



    // Update Profile Function

    public function updateProfile(Request $request)
    {
        
    $user = Auth::user();

    $validator = Validator::make($request->all(), [
        'name'       => 'sometimes|string|max:255',
        'mobile_no'  => 'sometimes|string|max:15',
        'address'    => 'sometimes|string|nullable',
        'profile_pic' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
        'professional_title' => 'sometimes|string|max:255|nullable',
        'bio' => 'sometimes|string|nullable',
        'social_links' => 'sometimes|array|nullable',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false, 
            'errors' => $validator->errors(
            )], 422);
    }

    // Update basic fields
    $user->fill($validator->validated());
    $user->save();

    // If profile_pic is uploaded
    if ($request->hasFile('profile_pic')) {
    // Step 1: Delete old profile picture from storage and database (if it exists)
    $oldMedia = $user->media()->where('type', 'profile_pic')->first();

    if ($oldMedia) {
        // Extract actual file path from stored URL
        $oldPath = str_replace('storage/', '', $oldMedia->url);

        // Delete the file from storage if it exists
        if (Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        // Remove the DB record
        $oldMedia->delete();
        }

        // Step 2: Store new profile picture
        $image = $request->file('profile_pic');
        $filename = Str::slug($user->name) . '_' . time() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('uploads/profiles', $filename, 'public');

        // Step 3: Create new media record
        $user->media()->create([
        'url' => 'storage/' . $path,
        'type' => 'profile_pic',
    ]);
 }

    // Get updated profile pic
    // $profilePic = $user->media()->where('type', 'profile_pic')->first();
    // $profilePicUrl = $profilePic
    //     ? asset($profilePic->url)
    //     : asset('uploads/profiles/default/' . $user->role . '.png');

    return response()->json([
        'status' => true,
        'message' => 'Profile updated successfully',
        'user' => $user->fresh()->load('roles')
    ]);
  }

    public function changePassword(Request $request)
    {
        $user = auth()->user();

         $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
            ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Current password does not match.'
            ], 403);
    }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Password updated successfully.'
        ]);
    }
    
    
    // 📌 Step 1: User requests password reset link
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()){
            return response() -> json ([
                'status' => false,
                'errors' => $validator->errors()
            ],422);
        }

        // Generate token + OTP
        $token = Str::random(64);
        $otp = rand(100000, 999999);


        // Store token in password_resets table
        DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $request->email],
        [
            'email' => $request->email,
            'token' => Hash::make($token),
            'otp' => Hash::make($otp),
            'created_at' => now(),
        ]
        );

        // Build frontend reset link query 
        $frontendUrl = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($request->email);


        // Send Reset Link if email match
    try {
        Mail::send('emails.passwordReset', [
            'url' => $frontendUrl,
            'otp' => $otp
        ], function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Reset Your Password');
        });

        return response()->json([
            'status' => true,
            'message' => 'Password reset link & OTP sent to your email successfully !!!'
        ]);

    } catch (\Exception $e) {
    return response()->json([
        'status' => false,
        'message' => 'Unable to send reset link...',
        'error' => $e->getMessage()
    ],500);

    }
}


    // 📌 Step 2: User submits new password from Reset Link
    public function resetPasswordlink(Request $request)
{
    $validator = Validator::make($request->all(),[
        'token' =>'required',
        'email' => 'required|email|exists:users,email',
        'password' => 'required|min:8|confirmed',
    ]);
    
    if ($validator->fails()){
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ],422);
    }

    // Find reset record
    $reset = DB::table('password_reset_tokens')
        ->where('email', $request->email)
        ->first();

    if (!$reset) {
        return response()->json([
            'status' => false, 
            'message' => 'Invalid reset request'
        ],400);
    }

    // Check token validity
    if (!Hash::check($request->token, $reset->token)) {
        return response()->json([
        'status' => false, 
        'message' => 'Invalid or expired token'], 400);
    }

    // Update user password
    $user = User::where('email', $request->email)->first();
    $user->password = Hash::make($request->password);
    $user->save();

    // Delete reset token (so it can’t be reused)
    DB::table('password_reset_tokens')->where('email', $request->email)->delete();

    return response()->json([
        'status' => true,
        'message' => 'Password reset successfully!'
    ]);
}

    // 📌 Step 3: User submits new password from OTP Request
    public function resetPasswordWithOtp(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()){
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ],422);
        }

        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$reset) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid reset request'
            ],400);
        }
        
        // Check OTP
        if (!Hash::check($request->otp, $reset->otp)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP'
            ],400);
        }
        
        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete reset entry
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password reset successfully using OTP!'
        ]);

    }

    // Check supension Status 
    public function suspensionStatus(Request $request)
    {
        $user = $request->user();

        if ($user->is_suspended) {
            return response()->json([
                'status' => false,
                'message' => "Your account is suspended until {$user->suspended_until}"
            ], 403);
        }
    }

}
