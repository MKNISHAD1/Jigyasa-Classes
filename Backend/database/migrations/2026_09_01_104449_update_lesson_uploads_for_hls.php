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
        Schema::table('lesson_uploads', function (Blueprint $table) {

            // Temporary original video stored on Laravel/server
            $table->string('temporary_file_path')
                ->nullable()
                ->after('mime_type');

            // Final HLS folder on Bunny
            $table->string('hls_storage_path')
                ->nullable()
                ->after('temporary_file_path');

            // Old Bunny-original-video fields are no longer needed
            $table->dropColumn([
                'temporary_storage_path',
                'temporary_object_name',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('lesson_uploads', function (Blueprint $table) {

            $table->string('temporary_storage_path')
                ->nullable()
                ->after('mime_type');

            $table->string('temporary_object_name')
                ->nullable()
                ->after('temporary_storage_path');

            $table->dropColumn([
                'temporary_file_path',
                'hls_storage_path',
            ]);
        });
    }
};
