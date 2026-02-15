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
            $table->string('question');           // default in English
            $table->text('answer');               // default in English
            $table->enum('type', ['general', 'payment', 'course', 'other'])->default('course');
            $table->boolean('status')->default(true); // active/inactive
            $table->timestamps();
            $table->softDeletes();               // optional, for soft delete
        });

        // Multilingual translations
        Schema::create('faq_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faq_id')->constrained('faqs')->onDelete('cascade');
            $table->string('locale',5)->index();  // 'hi', 'en', etc.
            $table->string('question');
            $table->text('answer');
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
