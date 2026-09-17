<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BunnyCleanupTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'lesson_id',
        'upload_uuid',
        'storage_path',
        'status',
        'attempts',
        'next_attempt_at',
        'last_attempt_at',
        'last_error',
        'completed_at',
    ];

    protected $casts = [
        'next_attempt_at' => 'datetime',
        'last_attempt_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Cleanup Types
    |--------------------------------------------------------------------------
    */

    public const TYPE_HLS_FOLDER = 'hls_folder';

    public const TYPE_MATERIAL = 'material';


    /*
    |--------------------------------------------------------------------------
    | Cleanup Statuses
    |--------------------------------------------------------------------------
    */

    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }


    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }


    public function scopeDue($query)
    {
        return $query
            ->whereIn('status', [
                self::STATUS_PENDING,
                self::STATUS_FAILED,
                ])
            ->where(function ($q) {
                $q->whereNull('next_attempt_at')
                  ->orWhere('next_attempt_at', '<=', now());
            });
    }
}