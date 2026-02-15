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
        'mobile_no' => 'required|string'
        ]);

        // it will return error message
        if ($validator-> fails()) {
            return response()->json([
                'status' =>false,
                'error' => $validator->errors()
            ]);
        } 

            // Check if email exists in soft-deleted user
            $softDeletedUser = User::withTrashed()->where('email', $request->email)->first();
            if ($softDeletedUser && $softDeletedUser->trashed()) {
                return response()->json([
                    'status' => false,
                    'message' => 'This email belongs to a deleted account. Please contact support to recover it.'
                ], 409);
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
            'message' => 'Dear User, Your account created successfully, Kindly check you Mail to verify Email Then Proceed to Login ',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

}