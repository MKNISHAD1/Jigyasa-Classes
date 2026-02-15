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
        Schema::create('lessons', function (Blueprint $table) {
            // Auto generate unoque IDs 
            $table->id();

            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');

            // delivery options
            $table->string('video_url')->nullable();     // e.g., YouTube unlisted
            $table->string('material_file')->nullable(); // optional quick-link file path

            $table->integer('order')->default(0)->index(); // lesson ordering

            // who uploaded the lesson (teacher/moderator)
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            $table->boolean('is_free_preview')->default(false);
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
