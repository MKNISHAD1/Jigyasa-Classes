<?php

namespace App\Models;

use Illuminate\Support\Str;
use App\Traits\HasTranslations;
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



    // get attached materials
    public function getMaterialsAttribute()
    {
        return $this->media->map(function ($file) {
            return [
                'id'   => $file->id,
                'url'  => asset('storage/' . $file->url),
                'name' => basename($file->url),
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
        $pullZoneUrl = rtrim(env('BUNNY_PULLZONE_URL'), '/');
        $securityKey = env('BUNNY_SIGNING_KEY');
        $expiryTime = time() + env('BUNNY_TOKEN_EXPIRY', 600); // default 10 min

        // must include leading slash as per Bunny’s docs
        $videoPath = '/' . ltrim("{$this->bunny_storage_path}/{$this->storage_object_name}", '/');

        // Build the hash base: key + path + expiry
        $hashableBase = $securityKey . $videoPath . $expiryTime;

        // Generate raw binary MD5
        $token = md5($hashableBase, true);

        // Convert to Base64 and make URL-safe
        $token = base64_encode($token);
        $token = strtr($token, '+/', '-_');
        $token = str_replace('=', '', $token);

        // Final signed playback URL
        return "{$pullZoneUrl}{$videoPath}?token={$token}&expires={$expiryTime}";
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

        //Force Delete From DB and Bunny Storage
        static::forceDeleted(function ($lesson) {
            // Delete materials locally
            foreach ($lesson->media()->withTrashed()->get() as $file) {
                if (Storage::exists($file->url)) {
                    Storage::delete($file->url);
                }
                $file->forceDelete();
        }

            // Delete translations permanently
            $lesson->translations()->withTrashed()->forceDelete();

        // Delete from Bunny CDN
        try {
            $storageZone = env('BUNNY_STORAGE_ZONE');
            $apiKey      = env('BUNNY_API_KEY');
            $regionHost  = env('BUNNY_REGION', 'sg.storage.bunnycdn.com');

            // Correct file path on Bunny storage
            $remoteFile = ltrim($lesson->bunny_storage_path . '/' . $lesson->storage_object_name, '/');

            $url = "https://{$regionHost}/{$storageZone}/{$remoteFile}";


            $response = Http::withHeaders([
                'AccessKey' => $apiKey,
            ])->delete($url);

            if ($response->successful()) {
                \Log::info("✅ Deleted Bunny file: {$remotePath}");
            } else {
                \Log::warning("⚠ Bunny delete failed for {$remotePath}: {$response->status()}");
            }
            }
            catch (\Throwable $e) {
                    \Log::error("❌ Bunny delete exception for lesson {$lesson->id}: " . $e->getMessage());
                }
        });
    }

}
