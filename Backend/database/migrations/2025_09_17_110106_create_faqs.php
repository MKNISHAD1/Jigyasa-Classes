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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('faq_template_id')
                  ->nullable()
                  ->constrained('faq_templates')
                  ->onDelete('set null');
            
            $table->foreignId('course_id')
                  ->nullable()
                  ->constrained('courses')
                  ->onDelete('cascade');
            // NULL course_id = Global FAQ
            
            $table->string('question'); // final rendered question
            $table->text('answer_final'); // final rendered answer after filling placeholders
            
            $table->json('filler')->nullable(); 
            // e.g. {"target_audience": "UPSC Students"}
            
            $table->enum('type', ['general', 'payment', 'course', 'other'])->default('course');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
