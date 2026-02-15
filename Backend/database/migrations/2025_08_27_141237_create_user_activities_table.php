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
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Type of activity (auth, profile, security, system, etc.)
            $table->string('activity_type')->nullable();
            
            // Specific action performed
            $table->string('action'); // e.g. login_success, login_failed, otp_verified, password_changed
            
            // Result of the action
            $table->string('status')->nullable(); // success | failed
            
            // Technical info
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            
            // Store extra details (flexible)
            $table->json('meta')->nullable(); 

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
