<?php

namespace Database\Factories;

use App\Models\Member;
use App\Services\LoanCalculator;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoanFactory extends Factory
{
    public function definition(): array
    {
        $amount = $this->faker->randomElement([1000000, 2000000, 5000000, 10000000]);
        $interestRate = 1.5;
        $termMonths = $this->faker->randomElement([6, 12, 24]);
        $method = 'flat';

        // Gunakan LoanCalculator agar konsisten dengan controller
        $financials = LoanCalculator::calculate((float) $amount, $interestRate, $termMonths, $method);

        return [
            'member_id' => Member::factory(),
            'amount' => $amount,
            'interest_rate' => $interestRate,
            'interest_method' => $method,
            'penalty_rate' => 0.1,
            'term_months' => $termMonths,
            'monthly_installment' => $financials['monthly_total'],
            'status' => 'pending',
            'apply_date' => $this->faker->dateTimeBetween('-1 year', '-6 months')->format('Y-m-d'),
            'approved_date' => null,
        ];
    }

    /**
     * Recalculate monthly_installment based on final resolved attributes.
     * This prevents mismatch when seeder overrides term_months or interest_rate.
     */
    public function configure(): static
    {
        return $this->afterMaking(function ($loan) {
            $financials = LoanCalculator::calculate(
                (float) $loan->amount,
                (float) $loan->interest_rate,
                (int) $loan->term_months,
                $loan->interest_method
            );
            $loan->monthly_installment = $financials['monthly_total'];
        });
    }
}
