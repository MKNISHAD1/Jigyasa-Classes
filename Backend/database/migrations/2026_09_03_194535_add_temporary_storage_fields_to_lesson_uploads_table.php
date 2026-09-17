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
            $table->string('temporary_storage_path')
                ->nullable()
                ->after('temporary_file_path');

            $table->string('temporary_object_name')
                ->nullable()
                ->after('temporary_storage_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('lesson_uploads', function (Blueprint $table) {
            $table->dropColumn([
                'temporary_storage_path',
                'temporary_object_name',
            ]);
        });
    }
};
