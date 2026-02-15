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
                Schema::dropIfExists('faqs'); // old course-based FAQs
        Schema::dropIfExists('faq_templates'); // old global templates

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
