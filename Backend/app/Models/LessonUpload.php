<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LessonUpload extends Model
{
    protected $fillable = [
        'upload_uuid',
        'user_id',
        'course_id',

        'title_en',
        'description_en',
        'title_hi',
        'description_hi',

        'original_filename',
        'mime_type',

        'temporary_file_path',
        'hls_storage_path',
        'temporary_storage_path',
        'temporary_object_name',

        'status',
        'lesson_id',
    ];

    protected static function booted()
    {
        static::creating(function ($upload) {
            if (!$upload->upload_uuid) {
                $upload->upload_uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
