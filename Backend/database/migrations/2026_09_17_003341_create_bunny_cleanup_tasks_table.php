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
        Schema::create('bunny_cleanup_tasks', function (Blueprint $table) {
            
            $table->id();

            // What kind of Bunny resource needs cleanup
            $table->string('type');

            // Optional references
            $table->unsignedBigInteger('lesson_id')->nullable();
            $table->string('upload_uuid')->nullable();

            // Complete Bunny Storage path
            $table->string('storage_path');

            // Cleanup lifecycle
            $table->string('status')->default('pending');

            // Retry information
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('next_attempt_at')->nullable();
            $table->timestamp('last_attempt_at')->nullable();

            // Last failure information
            $table->text('last_error')->nullable();

            // Successful cleanup timestamp
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Useful indexes
            $table->index('status');
            $table->index('next_attempt_at');
            $table->index('lesson_id');
            $table->index('upload_uuid');

            // Prevent duplicate cleanup tasks for the same Bunny resource
            $table->unique(
                ['type', 'storage_path'],
                'bunny_cleanup_type_path_unique'
            );

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bunny_cleanup_tasks');
    }
};
