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
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_account_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('type'); // income, expense
            $table->string('category'); // simpanan, pencairan, angsuran, operasional, dll
            $table->string('description')->nullable();
            $table->nullableMorphs('reference'); // polymorphic link to original trx
            $table->date('transaction_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
