<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;


class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make sure role exists
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);

        // Create or update the super admin account
        $user = User::updateOrCreate(
            ['email' => 'ashmanish3000x@gmail.com'], // you can change this
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'ashmanish3000x@gmail.com',
                'password' => Hash::make('SuperAdminMk#007'), // CHANGE THIS
                'email_verified_at' => now(),
            ]
        );

        // Assign role if not already
        if (!$user->hasRole('super_admin')) {
            $user->assignRole($superAdminRole);
        }


    }
}
