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
        // Course Translations
        Schema::table('course_translations', function (Blueprint $table) {
            $table->text('title_en_snapshot')->nullable()->after('title');
            $table->text('description_en_snapshot')->nullable()->after('description');
        });

        // Lesson Translations
        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->text('title_en_snapshot')->nullable()->after('title');
            $table->text('description_en_snapshot')->nullable()->after('description');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_translations', function (Blueprint $table) {
            $table->dropColumn(['title_en_snapshot', 'description_en_snapshot']);
        });

        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->dropColumn(['title_en_snapshot', 'description_en_snapshot']);
        });

    }
};
