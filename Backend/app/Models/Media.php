<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Media extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'url',
        'original_name', // It will store Original name of file(Clent side name )
        'type',        // e.g., 'profile_pic', 'thumbnail', 'resource', etc.
        'uploaded_by', // NEW
        'owner_id',    // polymorphic
        'owner_type',  // polymorphic

    ];

    /**
     * Polymorphic relationship to owning model.
     */
    public function owner()
    {
        return $this->morphTo();
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
    
    // 🔥 Automatically delete file from storage when Media is deleted
    protected static function booted()
    {
        static::deleting(function ($media) {
            if ($media->isForceDeleting()) {
                if ($media->url && Storage::disk('public')->exists($media->url)) {
                    Storage::disk('public')->delete($media->url);
                }
            }
        });
    }
}
