<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LessonTranslation extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['lesson_id', 'locale', 'title', 'description','source','status','reviewed_by','reviewed_at'];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

}
