<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class CourseTranslation extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'course_id', 
        'locale', 
        'title', 
        'description',
        'source',
        'status',
        'reviewed_by',
        'reviewed_at',
        'highlights',
        ];
        
    protected $casts = [
        'highlights' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

}
