<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class RegistrationController extends Controller
{
    public function register(Request $request) {

        // Apply Validation
        $validator = Validator::make($request->all(),[
        'name' => 'required|string|max:255',
        'username' => 'required|string|max:255|unique:users',
        'email' => 'required|string|email|max:255|unique:users,email,NULL,id,deleted_at,NULL',
        'password' => 'required|string|min:8',
        'mobile_no' => 'required|string|unique:users,mobile_no,NULL,id,deleted_at,NULL'
        ]);

        // it will return error message
        if ($validator-> fails()) {
            return response()->json([
                'status' =>false,
                'error' => $validator->errors()
            ]);
        } 

        // Check if email & mobile no. exists in soft-deleted user
            $softDeletedUser = User::withTrashed()
                ->where('email', $request->email)
                ->first();
            $softDeletedMobile = User::withTrashed()
                ->where('mobile_no', $request->mobile_no)
                ->first();

            $errors = [];

            // mail check
            if ($softDeletedUser && $softDeletedUser->trashed()) {
                $errors['email'][] =
                    'This email belongs to a previously deleted account. Please contact support to restore it.';
            }

            // mobile number check
            if ($softDeletedMobile && $softDeletedMobile->trashed()) {
                $errors['mobile_no'][] =
                    'This mobile number belongs to a previously deleted account. Please contact support to restore it.';
            }

            // throw error
            if (!empty($errors)) {
                return response()->json([
                    'status' => false,
                    'error' => $errors
                ],409);
            }



        // Creating User in Database
             $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'mobile_no' => $request->mobile_no,
            ]);

            //Assigning Deault Student Role
            $user -> assignRole('student');

        // Trigerring Verify Mail event 

        event(new Registered($user));
        
        // Isssuing Token to user
        $token = $user->createToken('token')->plainTextToken;

        // It will give show data of register user 
        return response()->json([
            'status'=> true,
            'message' => 'Account created successfully. Welcome to Jigyasa Classes! Please check your email to verify your account.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

}