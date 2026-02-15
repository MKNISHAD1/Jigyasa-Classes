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
        Schema::table('user_activities', function (Blueprint $table) {
            // Make user_id nullable
            $table->dropForeign(['user_id']); // Drop existing foreign key if any
            $table->unsignedBigInteger('user_id')->nullable()->change(); // Make nullable
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Re-add foreign key

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_activities', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable(false)->change(); // revert nullable
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

        });
    }
};
