<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();


        /**
         * Step 1: Define permissions
         */

        $permissions = [
            // User management
            'user.create',
            'user.view',
            'user.update',
            'user.delete',
            'user.restore',

            // Suspension
            'user.suspend',
            'user.unsuspend',

            // Role management
            'role.assign',
            'role.remove',

            // Course management
            'course.create',
            'course.view',
            'course.update',
            'course.delete',

            // Media / Files
            'media.manage',

            // Logs
            'logs.view',

            // Settings
            'system.settings',
        ];


        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        /**
         * Step 2: Create roles
         */

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin      = Role::firstOrCreate(['name' => 'admin']);
        $moderator  = Role::firstOrCreate(['name' => 'moderator']);
        $teacher    = Role::firstOrCreate(['name' => 'teacher']);
        $student    = Role::firstOrCreate(['name' => 'student']);

        /**
         * Step 3: Assign permissions to roles
         */

        // 🔥 Super Admin - All permissions
        $superAdmin->syncPermissions(Permission::all());

        // 🟡 Admin
        $admin->syncPermissions([
            'user.create',
            'user.view',
            'user.update',
            'user.delete',
            'user.restore',
            'user.suspend',
            'user.unsuspend',
            'role.assign',
            'role.remove',
            'course.create',
            'course.view',
            'course.update',
            'course.delete',
            'media.manage',
            'logs.view',
        ]);

        // 🔵 Moderator
        $moderator->syncPermissions([
            'user.view',
            'user.update',
            'user.suspend',
            'user.unsuspend',
            'logs.view',
        ]);

        // 🟣 Teacher
        $teacher->syncPermissions([
            'course.create',
            'course.view',
            'course.update',
            'course.delete',
            'media.manage',
        ]);

        // 🟤 Student
        $student->syncPermissions([
            'course.view',
            'user.update', // update own profile
        ]);
        
    }
}
