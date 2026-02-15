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
            $table->text('description')->nullable()->after('video_url');
            $table->string('duration')->nullable()->after('description');
            $table->string('status')->default('draft')->after('duration');
            $table->unsignedBigInteger('view_count')->default(0)->after('status');
            $table->boolean('is_locked')->default(false)->after('view_count');
            $table->timestamp('published_at')->nullable()->after('is_locked');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
                     $table->dropColumn([
                'description',
                'duration',
                'status',
                'view_count',
                'is_locked',
                'published_at',
            ]);
        });
    }
};
