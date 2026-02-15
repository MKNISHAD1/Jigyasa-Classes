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
        Schema::table('course_translations', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->softDeletes();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_translations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

    }
};
