<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Faq extends Model
{
    use HasFactory,HasTranslations;

    protected $fillable = [
        'question',
        'answer',
        'type',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];


    //  translations
    public function translations()
    {
        return $this->hasMany(FaqTranslation::class);
    }



}
