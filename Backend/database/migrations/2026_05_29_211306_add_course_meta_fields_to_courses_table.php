<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Add Field

             $table->enum('language', [
                'Hindi',
                'English',
                'Both'
            ])->default('Both')->after('price');

            $table->enum('difficulty_level', [
                'Beginner',
                'Intermediate',
                'Advanced',
                'All Levels'
            ])->default('All Levels')->after('language');

            $table->json('highlights')->nullable()->after('difficulty_level');

            $table->decimal('rating', 3, 2)
                  ->default(0)
                  ->after('highlights');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // remove if present

            $table->dropColumn([
                'language',
                'difficulty_level',
                'highlights',
                'rating'
            ]);
        });
    }
};
