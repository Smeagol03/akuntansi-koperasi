<?php

namespace Database\Factories;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoanRepaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'loan_id' => Loan::factory(),
            'amount' => 100000,
            'payment_date' => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'description' => 'Pembayaran Angsuran',
        ];
    }
}
