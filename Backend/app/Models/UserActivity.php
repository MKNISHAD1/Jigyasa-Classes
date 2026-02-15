<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    
    protected $table = 'user_activities';

    protected $fillable = [
        'user_id', 
        'action', 
        'ip_address', 
        'user_agent', 
        'extra',
        'target_user_id',
        'target_user_email',
        'target_user_username',
    ];

    protected $casts = [
        'extra' => 'array',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class,'target_user_id');
    }

}
