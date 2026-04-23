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
        Schema::table('loans', function (Blueprint $table) {
            $table->string('interest_method')->default('flat')->after('monthly_installment'); // flat, effective
            $table->decimal('penalty_rate', 5, 2)->default(0)->after('interest_method'); // daily penalty %
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn(['interest_method', 'penalty_rate']);
        });
    }
};
