<?php

namespace App\Http\Controllers\admin;


use App\Models\User;
use Carbon\Carbon;
use App\Models\Media;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountSuspendedMail;
use App\Mail\AccountUnsuspendedMail;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        THIS CONTROLLER FOR Moderator AND Admin ONLY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



class UserManagementController extends Controller
{

    // It will All Register user in database

public function alluser()
{
    $users = User::with('roles','media')->latest()->get()->map(function($user) {
        $roles = $user->getRoleNames()->toArray();
        $priority = [
            'super_admin' => 100,
            'admin'       => 80,
            'moderator'   => 60,
            'teacher'     => 40,
            'student'     => 20,
        ];

        // sort roles based on priority
        usort($roles, fn($a, $b) => $priority[$b] <=> $priority[$a]);
        $highest = $roles[0] ?? null;

        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'username' => $user->username,
            'role'     => $highest, // ✅ single highest role only
        ];
    });

    // ✅ Return JSON response
    return response()->json([
        'status' => true,
        'user'   => $users
    ]);
}

    // This will add  user in database by admin or moderator only
    
    public function newuser(Request $request)
    {
        $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'username' => 'required|string|max:255|unique:users',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'mobile_no' => 'required|string',
        'role'      => 'required|in:student,teacher,moderator,admin'
    ]);
    if ($validator-> fails()) {
        return response()->json([
            'status' =>false,
            'error' => $validator->errors()
        ]);
    }
    
        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->mobile_no = $request->mobile_no;
        $user->username = $request->username;
        $user->save();

        // Assigning Role with fallback role for new created ser
        $role = $request->role ?? 'student';
        $user->assignRole($role);


        // Log the activity
        ActivityLogger::log('Created_User',
                $user,        
                ['role' => $user->getRoleNames()->first()]
            );

        return response()->json([
            'status' =>true,
            'message' => 'User added successfully !!!!!!!',
            'user' => $user -> load ('roles') // so response includes role info
        ]);
    }
        
        
    // It will show the  all details about specific User by Userid   
    public function viewuser($id)
    {
        $user = User::with('roles')->find($id);
            
        if(!$user) {
            return response()->json([
                'status' =>false,
                'message' => 'User Not Found....'
            ]);
        }
            
        return response()->json([
            'status' =>true,
            'user' => $user,
            'roles' => $user->roles->pluck('name'), // current role(s)
            'all_roles' => \Spatie\Permission\Models\Role::pluck('name'), // for dropdown
            ]);
        }
        
        
    // This will Update User data 
    public function updateuser(Request $request, $id)
    {     
        $user = User::find($id);
            
        if(!$user) {
            return response()->json([
                'status' =>false,
                'message' => 'User Not Found....'
                ]);
            }
            
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
                
                // below chck unique on based on ID for current user too,, this works well 
                // 'username' => 'sometimes|string|max:255|unique:users,username,'.$id,
                // 'email' => 'sometimes|string|email|max:255|unique:users,email,'.$id,
                
                // trying Rule  method work without ID 
            'username' => [
                        'sometimes',
                        'string',
                        'max:255',
                        Rule::unique('users')->ignore($id),
                        ],
            'email' => [
                        'sometimes',
                        'string',
                        'email',
                        'max:255',
                        Rule::unique('users')->ignore($id),
                        ],
                // Rule end here
                
                
            'password' => 'sometimes|string|min:8',
            'mobile_no' => 'sometimes|string',
            'address'    => 'sometimes|string|nullable',
            'profile_pic' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:2048',
            'role'      => 'sometimes|in:student,teacher,moderator,admin'
            ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false, 
                'errors' => $validator->errors(
                )], 422);
        }

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
    //     : asset('uploads/profiles/default/' . ($user->getRoleNames()->firt()??'student') . '.png');

    // Updating in database
    $user->fill($validator->validated());
    // If null on effect on curren password
    if($request->filled('password')){
        $user->password = Hash::make($request->password);
    }

    $user->save();

    // Update Role if provided
    if($request->has('role')){
        $user->syncRoles([$request->role]);// replace old role with new
    }

    //Log activity 
    ActivityLogger::log('Updated_User',$user, [
    'updated_fields' => array_keys($validator->validated()),
    ]);


    return response()->json([
        'status' => true,
        'message' => 'User Details Updated Successfully..',
        'user' => $user -> load('roles'),
        'profile_pic' => $user->profile_pic

        ]);
  }


   // Delete User from database 

    public function deleteuser($id)
    {
        $user = User::find($id);

        if(!$user) {
             return response()->json([
                'status' =>false,
                'message' => 'User Not Found....'
            ]);
        }

        $user->deleted_by = auth()->id();
        $user->save();
        $user->delete();


        ActivityLogger::log('Soft_Deleted_User',$user,['role'=>$user->getRoleNames()->first()]);


        return response()->json([
                'status' =>true,
                'message' => 'User Deleted Successfully ......'   
            ]);
    }

    // 🗑️ View Trashed Users
    public function trashedUsers()
    {
        $users = User::onlyTrashed()->orderBy('deleted_at', 'DESC')->get();

        return response()->json([
            'status' => true,
            'user' => $users
        ]);
    }

    // ♻️ Restore a Soft Deleted User

    public function restoreUser($id)
    {
        $user = User::onlyTrashed()->find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found or not trashed',
            ], 404);
        }
        // It will Restore Users
        $user->restore();
        
        // Activity Log
        ActivityLogger::log('Restored_User',$user);
          
        return response()->json([
            'status' => true,
            'message' => 'User restored successfully',
            'users'=> $user -> load('roles')
        ]);
    }

    // ❌ Permanently Delete User (Force Delete)

    public function forceDeleteUser($id)
    {
        $user = User::onlyTrashed()->find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found or not trashed'
            ], 404);
        }

        $loguser = $user->replicate();
        
        $user->forceDelete();

        ActivityLogger::log('Force_Deleted_User',$loguser);

        return response()->json([
            'status' => true,
            'message' => 'User permanently deleted'
        ]);
    }

    // Suspending User (Temporary Ban)
    public function suspendUser(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string|max:255',
            'until' => 'nullable|date|after:now',
        ]);

        $user = User::findOrFail($id);
        $user->is_suspended = true;
        $user->suspension_reason = $request->reason ?? 'No reason provided';
        $user->suspended_until = $request->until ? Carbon::parse($request->until) : null;
        $user->suspension_by = auth()->id();    // <<-- who suspended
        $user->save();

        // Send Suspension Mail
        // Mail::to($user->email)->send(new AccountSuspendedMail($user->suspension_reason, $user->suspended_until)); 
        
        try {
            Mail::to($user->email)->send(new AccountSuspendedMail($user->suspension_reason, $user->suspended_until));
            } catch (\Exception $e) {
            \Log::error("Mail failed: ".$e->getMessage());
        }

        // Log Suspending User
        ActivityLogger::log('Suspended_Account',
                $user,
                ['reason' => 'Manual Suspension Added']
            );



        return response()->json([
            'status' => true,
            'message' => 'User suspended successfully',
            'suspended_until' => $user->suspended_until,
            'suspension_reason' => $user->suspension_reason,
        ]);
    }


    // Suspended Users List 
    public function suspendedUsersList()
    {
        $users = User::where('is_suspended', true)
            ->with('roles')
            ->get();

        return response()->json([
            'status' => true,
            'users' => $users
        ]);
    }


    public function unsuspendUser($id)
    {
        $user = User::findOrFail($id);

        if (! $user->is_suspended) {
            return response()->json([
                'status' => false,
                'message' => 'User is not suspended'
            ], 400);
        }

        // Reset suspension fields
        $user->is_suspended = false;
        $user->suspension_reason = null;
        $user->suspended_until = null;
        $user->save();

        // Log unsuspension
        ActivityLogger::log(
            "Lifted_Suspension",
            $user,
            ['reason' => 'Manual suspension lifted']
        );

        // Send mail
        // Mail::to($user->email)->send(new AccountUnsuspendedMail($user,'admin'));

        try {
            Mail::to($user->email)->send(new AccountUnsuspendedMail($user,'admin'));
            } catch (\Exception $e) {
            \Log::error("Mail failed: ".$e->getMessage());
        }


        return response()->json([
            'status' => true,
            'message' => 'User unsuspended successfully',
            'user' => $user->load('roles'),
        ]);
    }

    public function getTeachers()
    {
        $teachers = User::role('teacher')->select('id', 'name', 'email')->get();

        return response()->json([
            'status' => true,
            'teachers' => $teachers
        ]);
    }
   
}
