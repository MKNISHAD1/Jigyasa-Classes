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
        Schema::table('course_translations', function (Blueprint $table) {
            $table->string('source', 16)->default('machine')->after('locale'); // 'machine' | 'human'
            $table->string('status', 16)->default('need_review')->after('source'); // 'need_review' | 'done'
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->index(['source', 'status']);
        });

        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->string('source', 16)->default('machine')->after('locale');
            $table->string('status', 16)->default('need_review')->after('source');
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->index(['source', 'status']);
        });
    }

    public function down()
    {
        Schema::table('course_translations', function (Blueprint $table) {
            $table->dropColumn(['source', 'status', 'reviewed_by', 'reviewed_at']);
        });
        Schema::table('lesson_translations', function (Blueprint $table) {
            $table->dropColumn(['source', 'status', 'reviewed_by', 'reviewed_at']);
        });

    }
};
