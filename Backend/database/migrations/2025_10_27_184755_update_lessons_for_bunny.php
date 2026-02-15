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
        Schema::table('lessons', function (Blueprint $table) {
            //
            $table->dropColumn('video_id'); // remove YouTube column if exists
            $table->dropColumn('video_url'); // remove YouTube column if exists
            $table->dropColumn('duration'); // remove YouTube column if exists
            $table->dropColumn('video_provider'); // remove YouTube column if exists

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            //
        });
    }
};
