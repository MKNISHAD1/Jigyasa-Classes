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
        Schema::table('lesson_translations', function (Blueprint $table) {
                        // Make title nullable (required for auto translation to work)
            $table->string('title')->nullable()->change();

            // description should already be nullable, but we ensure it
            $table->text('description')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lesson_translations', function (Blueprint $table) {
                        // rollback (not recommended but required for migration structure)
            $table->string('title')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();

        });
    }
};
