<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;



class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes,HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
    'name',
    'email',
    'password',
    'username',
    'mobile_no',
    'address',
    'profile_pic',
    'two_factor_code',
    'suspended_until',
    'is_suspended',
    'suspension_reason',
    'two_factor_verified_at',
    'professional_title',
    'bio',
    'social_links',
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    /////////////////// Verify Email after Registration to check authenticated Email\\\\\\\\\\\\\\\\\\\\\\

    // make sure users table has email_verified_at (timestamp, nullable)
    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_verified_at' => 'datetime',
        'suspended_until' => 'datetime',
        'is_suspended'    => 'boolean',
        'password' => 'hashed',
        'social_links' => 'array',
    ];


    /////////////////// Deafult Student while Registration \\\\\\\\\\\\\\\\\\\\\\\\\\\
    
    protected static function booted()
    {
    
        // If user doesn’t already have a role, assign default
        static::created(function ($user) {
            if (!$user->hasAnyRole()) {
                $user->assignRole('student');
            }

            $role = $user->getRoleNames()->first();

            $defaultTitles = [
                'student' => 'Student',
                'teacher' => 'Instructor',
                'moderator' => 'Moderator',
                'admin' => 'Administrator',
                'super_admin' => 'Super Administrator',
            ];

            $user->update([
                'professional_title' =>
                    $defaultTitles[$role] ?? 'Member'
            ]);
        });

        // Automatically restore file from storage when User is restored
        static::restored(function ($user) {
            foreach ($user->media()->withTrashed()->get() as $media) {
                $media->restore();
            }

            foreach ($user->courses()->withTrashed()->get() as $course) {
                $course->restore();
            }
        });


        // 🔥 Automatically delete file from storage when User is deleted
        static::deleting(function ($user) {
                if ($user->isForceDeleting()) {
                    // delete media
                    foreach ($user->media as $media) {
                        $media->forceDelete();
                    }

                    // delete courses
                    foreach ($user->courses as $course) {
                        $course->forceDelete();
                    }
                }
        });    
    }

    // Media link function 
    public function media()
    {
        return $this->morphMany(Media::class, 'owner');
    }

    // Creating accessor for fetching profile pic
    public function getProfilePicAttribute()
    {
     $media = $this->media()->where('type', 'profile_pic')->first();

     $role = $this->getRoleNames()->first() ?? 'student'; // fallback role so no error

        return $media
            ? asset($media->url)
            : asset("uploads/profiles/default/{$role}.png");
    }

    public function coursesTaught()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function coursesCreated()
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    public function lessonsUploaded()
    {
        return $this->hasMany(Lesson::class, 'uploaded_by');
    }




}
