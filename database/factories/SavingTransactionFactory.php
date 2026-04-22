<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavingTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'amount' => $this->faker->randomElement([50000, 100000, 200000, 500000]),
            'type' => $this->faker->randomElement(['pokok', 'wajib', 'sukarela']),
            'description' => $this->faker->sentence(),
            'transaction_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }
}
