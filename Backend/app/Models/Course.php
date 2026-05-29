<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Course extends Model
{
    use HasFactory, SoftDeletes, HasTranslations;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'subcategory_id',
        'price',
        'teacher_id',
        'created_by',
        'status',
        'published_at',
        'thumbnail_id',
        'is_featured',
        'is_archived',
        'language',
        'difficulty_level',
        'highlights',
        'rating',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_archived' => 'boolean',
        'published_at' => 'datetime',
        'highlights' => 'array',
        'rating' => 'decimal:2',
    ];

    /* ---------------- Relations ---------------- */

    public function translations()
    {
        return $this->hasMany(CourseTranslation::class);
    }


    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    public function modules()
    {
        return $this->hasMany(
            CourseModule::class
        )->orderBy('order');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }


    // Centralized media polymorphism
    public function media()
    {
        return $this->morphMany(Media::class, 'owner');
    }

    // One thumbnail per course (type = 'thumbnail')
    public function thumbnail()
    {
        return $this->morphOne(Media::class, 'owner')->where('type', 'course_thumbnail');
    }

    /* --------------- Accessors ----------------- */

    // Fallback logic for thumbnail: if none uploaded, fall back to teacher's profile pic
    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail) {
            // your Media::url stores a relative path; wrap with asset()
            return asset('storage/' . $this->thumbnail->url);
        }

        // final fallback: a generic placeholder image
        return asset('storage/uploads/courses/default/placeholder.jpg');
    }

    /* --------------- Scopes (optional) --------- */

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }



    /* ---------------- Model Events (Delete, restore and force delete)---------------- */

    protected static function booted()
    {
        
        parent::booted();
        
        // Cascade Automatically restore when courses are restored
        static::restored(function ($course) {

            // restore translations
            $course->translations()->withTrashed()->restore();

            // restore thumbnail
            if ($course->thumbnail()->withTrashed()->exists()) {
                $course->thumbnail()->restore();
            }

            // restore lessons
            foreach ($course->lessons()->withTrashed()->get() as $lesson) {
                $lesson->restore();
            }
        });

        /* ---------------- Soft Delete ---------------- */
        static::deleting(function ($course) {
            if (!$course->isForceDeleting()) {
                // soft delete translations
                $course->translations()->delete();

                // soft delete lessons
                foreach ($course->lessons as $lesson) {
                    $lesson->delete();
                }

                // soft delete thumbnail
                if ($course->thumbnail) {
                    $course->thumbnail->delete();
                }
            }
        });

        // 🔥 Automatically delete lesson, media and translation from storage when Course is deleted
        static::forceDeleted(function ($course) {
            if ($course->isForceDeleting()) {

                // delete translations permanently
                $course->translations()->withTrashed()->forceDelete();

                // delete thumbnail permanently
                if ($course->thumbnail) {
                    $course->thumbnail->forceDelete();
                }

                // force delete lessons + their files
                foreach ($course->lessons()->withTrashed()->get() as $lesson) {
                    $lesson->forceDelete();
                }

            }
        });
    }
    

}
