<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use App\Models\SavingTransaction;
use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::factory()->create([
            'name' => 'Admin Koperasi',
            'email' => 'admin@koperasi.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Create 20 Members
        $members = Member::factory()->count(20)->create();

        foreach ($members as $member) {
            // A. Simpanan Pokok (Wajib ada satu kali)
            SavingTransaction::create([
                'member_id' => $member->id,
                'amount' => 100000,
                'type' => 'pokok',
                'description' => 'Simpanan Pokok Pendaftaran',
                'transaction_date' => $member->join_date,
            ]);

            // B. Simpanan Wajib & Sukarela Acak
            SavingTransaction::factory()->count(rand(5, 12))->create([
                'member_id' => $member->id,
            ]);
        }

        // 3. Create active loans for some members
        $loanMembers = $members->random(5);
        foreach ($loanMembers as $member) {
            $loan = Loan::factory()->create([
                'member_id' => $member->id,
                'status' => 'active',
            ]);

            // Create some repayments for active loans
            LoanRepayment::factory()->count(rand(1, 3))->create([
                'loan_id' => $loan->id,
                'amount' => $loan->monthly_installment,
            ]);
        }

        // 4. Create paid off loans
        $paidMembers = $members->whereNotIn('id', $loanMembers->pluck('id'))->random(3);
        foreach ($paidMembers as $member) {
            $loan = Loan::factory()->create([
                'member_id' => $member->id,
                'status' => 'paid_off',
                'term_months' => 6,
            ]);

            // Create all 6 repayments to make it paid off
            for ($i = 1; $i <= 6; $i++) {
                LoanRepayment::create([
                    'loan_id' => $loan->id,
                    'amount' => $loan->monthly_installment,
                    'payment_date' => date('Y-m-d', strtotime($loan->approved_date . " +$i month")),
                    'description' => "Angsuran ke-$i",
                ]);
            }
        }
    }
}
