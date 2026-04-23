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
        Schema::create('saving_interest_configs', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique(); // pokok, wajib, sukarela, berjangka
            $table->decimal('interest_rate', 5, 2)->default(0); // % per tahun
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_interest_configs');
    }
};
