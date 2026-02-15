<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('course_translations', function (Blueprint $table) {
            // Make title nullable
            $table->string('title')->nullable()->change();

            // Make description nullable (already is, but ensure consistency)
            $table->text('description')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('course_translations', function (Blueprint $table) {
            // Revert changes - make non-nullable again
            $table->string('title')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
        });
    }
};

