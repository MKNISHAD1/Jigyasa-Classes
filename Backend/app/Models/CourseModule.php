<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasTranslations;

class CourseModule extends Model
{
    use SoftDeletes, HasTranslations;

    protected $fillable = [
        'course_id',
        'title',
        'order'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons()
    {
        return $this->hasMany(
            Lesson::class,
            'module_id'
        )->orderBy('order');
    }

    public function translations()
    {
        return $this->hasMany(
            CourseModuleTranslation::class
        );
    }
}
