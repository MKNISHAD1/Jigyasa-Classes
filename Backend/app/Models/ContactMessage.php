<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'category',
        'subject',
        'message',
        'status',
        'closed_at',
        'closed_by',
        'final_resolution',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
    ];

    public function views(): HasMany
    {
        return $this->hasMany(ContactMessageView::class);
    }
    
    public function comments(): HasMany
    {
        return $this->hasMany(ContactMessageComment::class)
            ->orderBy('created_at');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}