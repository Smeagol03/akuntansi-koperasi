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
        Schema::table('saving_transactions', function (Blueprint $table) {
            $table->foreignId('saving_account_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            
            // Drop redundant columns as they are now part of the account
            $table->dropForeign(['member_id']);
            $table->dropColumn(['member_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saving_transactions', function (Blueprint $table) {
            $table->dropForeign(['saving_account_id']);
            $table->dropColumn('saving_account_id');
            
            $table->foreignId('member_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type')->nullable();
        });
    }
};
