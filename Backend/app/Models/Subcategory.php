<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;

class Subcategory extends Model
{
    use HasTranslations;

    protected $fillable = ['name', 'slug', 'category_id', 'who_can_enroll'];

    public function translations()
    {
        return $this->hasMany(SubcategoryTranslation::class);
    }


    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
