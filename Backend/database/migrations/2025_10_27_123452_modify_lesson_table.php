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
            $table->string('video_provider')->nullable()->default('bunny'); // bunny, youtube, vimeo, etc.
            $table->string('storage_object_name')->nullable(); // actual file name in Bunny storage
            $table->string('bunny_video_url')->nullable(); // pull zone playback URL
            $table->string('bunny_storage_path')->nullable(); // internal path in Bunny storage

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
