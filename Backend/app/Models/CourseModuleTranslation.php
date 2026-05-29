<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseModuleTranslation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_module_id',
        'locale',
        'title',
        'source',
        'status',
        'reviewed_by',
        'reviewed_at'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(
            CourseModule::class,
            'course_module_id'
        );
    }
}