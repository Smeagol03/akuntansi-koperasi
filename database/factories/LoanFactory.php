<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoanFactory extends Factory
{
    public function definition(): array
    {
        $amount = $this->faker->randomElement([1000000, 2000000, 5000000, 10000000]);
        $interestRate = 1; // 1%
        $termMonths = $this->faker->randomElement([6, 12, 24]);
        $monthlyInstallment = ($amount / $termMonths) + ($amount * ($interestRate / 100));

        return [
            'member_id' => Member::factory(),
            'amount' => $amount,
            'interest_rate' => $interestRate,
            'term_months' => $termMonths,
            'monthly_installment' => $monthlyInstallment,
            'status' => $this->faker->randomElement(['pending', 'active', 'paid_off']),
            'apply_date' => $this->faker->dateTimeBetween('-1 year', '-6 months')->format('Y-m-d'),
            'approved_date' => $this->faker->dateTimeBetween('-5 months', 'now')->format('Y-m-d'),
        ];
    }
}
