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
        Schema::table('media', function (Blueprint $table) {
                        
            if (!Schema::hasColumn('media', 'uploaded_by')) {
                $table->foreignId('uploaded_by')->nullable()->after('type')->constrained('users')->nullOnDelete();
            }

            // If your media table doesn't have the polymorphic cols, uncomment:
            // if (!Schema::hasColumn('media', 'owner_id')) {
            //     $table->unsignedBigInteger('owner_id')->nullable()->index();
            // }
            // if (!Schema::hasColumn('media', 'owner_type')) {
            //     $table->string('owner_type')->nullable()->index();
            // }

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            //
            if (Schema::hasColumn('media', 'uploaded_by')) {
                $table->dropConstrainedForeignId('uploaded_by');
            }
        });
    }
};
