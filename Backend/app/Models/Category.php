<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;


class Category extends Model
{
    use HasTranslations;
    
    protected $fillable = ['name', 'slug'];

    public function translations()
    {
        return $this->hasMany(CategoryTranslation::class);
    }

    public function subcategories()
    {
        return $this->hasMany(Subcategory::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}

