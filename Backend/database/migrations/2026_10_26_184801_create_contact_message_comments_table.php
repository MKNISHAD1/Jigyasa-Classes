<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_message_comments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('contact_message_id')
                ->constrained('contact_messages')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('comment');

            $table->timestamps();

            $table->index([
                'contact_message_id',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_message_comments');
    }
};