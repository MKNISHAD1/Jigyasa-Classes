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
                
                $table->id();

                $table->string('title');
                $table->text('description');

                // Relationships
                $table->foreignId('category_id')->constrained()->cascadeOnDelete();
                $table->foreignId('subcategory_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

                // Pricing
                $table->decimal('price', 10, 2)->nullable();

                // FAQs as JSON
                $table->json('faqs')->nullable();

                // Publishing status
                $table->enum('status', ['draft', 'published'])->default('draft'); 
                $table->timestamp('published_at')->nullable();

                // Media
                $table->unsignedBigInteger('thumbnail_id')->nullable(); // ✅ link to media
                $table->foreign('thumbnail_id')->references('id')->on('media')->nullOnDelete();

                // Flags
                $table->boolean('is_featured')->default(false); // ✅ highlight courses on frontend later
                $table->boolean('is_archived')->default(false); // ✅ optional if you want teachers to “hide” old courses

                $table->timestamps();
                $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_courses');
    }
};
