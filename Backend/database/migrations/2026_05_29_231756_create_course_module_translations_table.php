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
        Schema::create('course_module_translations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('course_module_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('locale');

            $table->string('title')->nullable();

            $table->enum('source', ['machine', 'human'])
                ->default('machine');

            $table->enum('status', [
                'need_review',
                'approved',
                'rejected'
            ])->default('need_review');

            $table->unsignedBigInteger('reviewed_by')
                ->nullable();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_module_translations');
    }
};
