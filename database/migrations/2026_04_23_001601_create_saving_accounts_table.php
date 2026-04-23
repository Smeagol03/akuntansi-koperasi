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
        Schema::create('saving_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // pokok, wajib, sukarela, berjangka
            $table->string('account_number')->unique();
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->default(0); // snapshot bunga saat buka/config
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->string('status')->default('active'); // active, closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_accounts');
    }
};
