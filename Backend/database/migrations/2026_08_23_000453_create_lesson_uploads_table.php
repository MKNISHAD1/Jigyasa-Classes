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
        Schema::create('lesson_uploads', function (Blueprint $table) {
            $table->id();

            $table->uuid('upload_uuid')->unique();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('course_id')
                ->constrained('courses')
                ->cascadeOnDelete();

            $table->string('title_en');
            $table->text('description_en')->nullable();

            $table->string('title_hi')->nullable();
            $table->text('description_hi')->nullable();

            $table->string('original_filename');
            $table->string('mime_type')->nullable();

            $table->string('temporary_storage_path');
            $table->string('temporary_object_name');

            $table->enum('status', [
                'uploading',
                'uploaded',
                'completed',
                'cancelled',
                'failed',
            ])->default('uploading');

            $table->foreignId('lesson_id')
                ->nullable()
                ->constrained('lessons')
                ->nullOnDelete();

            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_uploads');
    }
};
