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
        Schema::create('courses', function (Blueprint $table) {
            // Auto generate unoque IDs 
            $table->id();

            // Course Name and Description
            $table->string('title');
            $table->text('description')->nullable();

            // simple categorization for now (you can normalize later)
            $table->string('category')->nullable()->index();
            $table->string('subcategory')->nullable()->index();

            $table->decimal('price', 10, 2)->default(0);
            $table->json('faqs')->nullable(); // [{question, answer}, ...]

            // who is the main teacher, and who created this course (teacher or moderator)
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // status flags (optional but handy)
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
