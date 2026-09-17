<?php

namespace App\Models;

use Illuminate\Support\Str;
use App\Traits\HasTranslations;
use App\Services\BunnyStorageService;

use Illuminate\Support\Facades\Http;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory, SoftDeletes, HasTranslations;

    protected $fillable = [
        'course_id',
        'module_id',
        'title',
        'bunny_video_url',
        'storage_object_name',
        'bunny_storage_path',
        'order',
        'uploaded_by',
        'is_free_preview',
        'description',
        'duration',
        'status',
        'view_count',
        'published_at',
    ];

    protected $casts = [
        'is_free_preview' => 'boolean',
        'published_at'    => 'datetime',
        'view_count'      => 'integer',

        
    ];
    
    protected $appends = [

        'is_locked', // auto-derived
        'materials'
    ];


    /* ---------------- Relations ---------------- */

    public function translations()
    {
        return $this->hasMany(LessonTranslation::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function module()
    {
        return $this->belongsTo(
            CourseModule::class
        );
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // All attached lesson files (PDF, DOC, PPT, etc.)
    public function media()
    {
        return $this->morphMany(Media::class, 'owner')
                    ->where('type', 'lesson_resource');
    }


    // If you want quick access to the first resource file
    public function firstResource()
    {
        return $this->morphMany(Media::class, 'owner')
                    ->where('type', 'lesson_resource')
                    ->withTrashed();
    }


    /* ---------------- Accessors ---------------- */

    // Bunny CDN
    public function getEmbedUrlAttribute()
    {
        $zoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');
        return $this->bunny_video_url ?: "{$zoneUrl}/{$this->bunny_storage_path}/{$this->storage_object_name}";
    }



    // get attached materials bunny
    public function getMaterialsAttribute()
    {
        return $this->media->map(function ($file) {
            return [
                'id' => $file->id,

                'url' => $this->generateBunnySignedUrl(
                    parse_url($file->url, PHP_URL_PATH)
                ),

                'name' => $file->original_name ?? basename($file->url),
            ];
        });
    }

    // Derived field: is_locked
    public function getIsLockedAttribute()
    {
        // Free preview lessons are unlocked; all others are locked
        return !$this->is_free_preview;
    }


    /* ---------------- Helper Methods ---------------- */

    public function getSignedUrlAttribute()
    {
        return $this->generateBunnySignedUrl(
            "{$this->bunny_storage_path}/{$this->storage_object_name}"
        );
    }

    public function generateBunnySignedUrl($path)
    {
        $pullZoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');
        $securityKey = env('BUNNY_SIGNING_KEY');
        $expiryTime = time() + env('BUNNY_TOKEN_EXPIRY', 600);

        // Must include leading slash
        $path = '/' . ltrim($path, '/');

        // Build hash base
        $hashableBase = $securityKey . $path . $expiryTime;

        // MD5 → Base64 → URL-safe
        $token = md5($hashableBase, true);
        $token = base64_encode($token);
        $token = strtr($token, '+/', '-_');
        $token = str_replace('=', '', $token);

        return "{$pullZoneUrl}{$path}?token={$token}&expires={$expiryTime}";
    }

    public function refreshSignedUrl()
    {
        return $this->signed_url;
    }

    public static function generateStoragePath($courseTitle)
    {
        // convert "Laravel Mastery" -> "laravel-mastery"
        return Str::slug($courseTitle);
    }

    public static function generateStorageFileName($lessonTitle, $extension = 'mp4')
    {
        // convert "Eloquent Basics" -> "eloquent-basics.mp4"
        return Str::slug($lessonTitle) . '.' . $extension;
    }

    // Scope for published lessons only
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->where(function ($q) {
                         $q->whereNull('published_at')
                           ->orWhere('published_at', '<=', now());
                     });
    }


    /* ---------------- Model Events ---------------- */

    protected static function booted()
    {
        //This eventy automatically add updated vidoe  id from link 
        parent::booted();

        static::saving(function ($lesson) {
            // Automatically generate folder structure if course is loaded
            if ($lesson->course && empty($lesson->bunny_storage_path)) {
                $lesson->bunny_storage_path = self::generateStoragePath($lesson->course->title);
            }

            // Auto-generate file name if missing
            if (empty($lesson->storage_object_name)) {
                $lesson->storage_object_name = self::generateStorageFileName($lesson->title);
            }

            // Construct Bunny video URL automatically
            if (empty($lesson->bunny_video_url)) {
                $zoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');
                $lesson->bunny_video_url = "{$zoneUrl}/{$lesson->bunny_storage_path}/{$lesson->storage_object_name}";
            }
        });

        static::deleting(function ($lesson) {
            if (!$lesson->isForceDeleting()) {
                $lesson->translations()->delete();
                $lesson->media()->delete();
            }
        });

        // Restore: restore translations
        static::restoring(function ($lesson) {
            $lesson->translations()->withTrashed()->restore();
            $lesson->media()->withTrashed()->restore();
        });

        // Force Delete From DB and Bunny Storage
        static::forceDeleting(function ($lesson) {

            $bunny = app(BunnyStorageService::class);

            $errors = [];

            /*
            |--------------------------------------------------------------------------
            | 1. Delete entire Bunny HLS folder
            |--------------------------------------------------------------------------
            |
            | Example:
            | course-name/lesson-videos/uuid/
            |
            | This removes playlist.m3u8 + all segment_XXXXX.ts files.
            |
            */
            if (!empty($lesson->bunny_storage_path)) {
                try {

                    $bunny->deleteHlsFolder(
                        $lesson->bunny_storage_path
                    );

                } catch (\Throwable $e) {

                    $errors[] = 'HLS folder: ' . $e->getMessage();

                    \Log::error(
                        'Bunny HLS cleanup failed during lesson force delete.',
                        [
                            'lesson_id' => $lesson->id,
                            'path' => $lesson->bunny_storage_path,
                            'error' => $e->getMessage(),
                        ]
                    );
                }
            }


            /*
            |--------------------------------------------------------------------------
            | 2. Get all lesson materials
            |--------------------------------------------------------------------------
            |
            | withTrashed() is required because a lesson may already have been
            | soft-deleted and its materials may also be soft-deleted.
            |
            */
            $mediaFiles = $lesson->media()
                ->withTrashed()
                ->get();


            /*
            |--------------------------------------------------------------------------
            | 3. Delete every material from Bunny
            |--------------------------------------------------------------------------
            */
            foreach ($mediaFiles as $media) {

                try {

                    $bunny->deleteMaterial($media);

                } catch (\Throwable $e) {

                    $errors[] =
                        "Material {$media->id}: " . $e->getMessage();

                    \Log::error(
                        'Bunny lesson material cleanup failed during force delete.',
                        [
                            'lesson_id' => $lesson->id,
                            'media_id' => $media->id,
                            'url' => $media->url,
                            'error' => $e->getMessage(),
                        ]
                    );
                }
            }


            /*
            |--------------------------------------------------------------------------
            | 4. IMPORTANT:
            |    Do NOT permanently delete the Lesson if Bunny cleanup failed.
            |--------------------------------------------------------------------------
            |
            | This prevents a DB record from disappearing while Bunny files remain.
            |
            | The next force-delete attempt can retry the cleanup.
            |
            */
            if (!empty($errors)) {

                throw new \RuntimeException(
                    'Bunny cleanup failed. Lesson was NOT permanently deleted. '
                    . implode(' | ', $errors)
                );
            }


            /*
            |--------------------------------------------------------------------------
            | 5. Bunny cleanup succeeded.
            |    Now permanently remove database children.
            |--------------------------------------------------------------------------
            */

            foreach ($mediaFiles as $media) {
                $media->forceDelete();
            }


            // Permanently delete lesson translations
            $lesson->translations()
                ->withTrashed()
                ->forceDelete();
        });
    }

}
