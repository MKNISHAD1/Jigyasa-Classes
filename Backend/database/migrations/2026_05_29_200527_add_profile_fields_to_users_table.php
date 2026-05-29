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
        Schema::table('users', function (Blueprint $table) {
            // New field
            
            $table->string('professional_title')->nullable()->after('address');

            $table->text('bio')->nullable()->after('professional_title');

            $table->json('social_links')->nullable()->after('bio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // drop if available
            $table->dropColumn([
                'professional_title',
                'bio',
                'social_links'
            ]);
        });
    }
};
