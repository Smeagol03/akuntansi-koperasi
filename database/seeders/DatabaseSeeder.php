<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Models\SavingInterestConfig;
use App\Models\CashAccount;
use App\Models\AppSetting;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Services\LoanCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Create Accounting COA
        $this->call(CoaSeeder::class);

        // 0.5 Create App Settings
        $settings = [
            ['key' => 'app_name', 'value' => 'Koperasi Merah Putih', 'type' => 'string'],
            ['key' => 'app_address', 'value' => 'Jalan Merdeka No. 1, Jakarta', 'type' => 'string'],
            ['key' => 'app_logo', 'value' => '/favicon.svg', 'type' => 'string'],
            ['key' => 'default_interest_method', 'value' => 'flat', 'type' => 'string'],
            ['key' => 'default_penalty_rate', 'value' => '0.1', 'type' => 'numeric'],
        ];

        foreach ($settings as $setting) {
            AppSetting::create($setting);
        }

        // 1. Create Configs
        $configs = [
            ['type' => 'pokok', 'interest_rate' => 0],
            ['type' => 'wajib', 'interest_rate' => 0],
            ['type' => 'sukarela', 'interest_rate' => 4.5],
            ['type' => 'berjangka', 'interest_rate' => 7],
        ];

        foreach ($configs as $cfg) {
            SavingInterestConfig::create($cfg);
        }

        // 2. Create Cash Accounts
        $cashMain = CashAccount::create(['name' => 'Kas Utama', 'type' => 'cash', 'balance' => 0, 'status' => 'active']);
        $bankBRI = CashAccount::create(['name' => 'Rekening Bank', 'type' => 'bank', 'account_number' => '00123456789', 'balance' => 0, 'status' => 'active']);

        // 3. Create Admin User
        User::factory()->create([
            'name' => 'Admin Koperasi',
            'email' => 'admin@koperasi.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 4. Create 20 Members
        $members = Member::factory()->count(20)->create([
            'notes' => 'Catatan anggota hasil pendaftaran awal.',
            'emergency_contact_name' => 'Keluarga Inti',
            'emergency_contact_phone' => '081234567890',
        ]);

        $savingsService = app(\App\Services\SavingsService::class);

        foreach ($members as $member) {
            // Initial Deposits (This will automatically update CashAccount via Service)
            $savingsService->deposit($member, 'pokok', 100000, $member->join_date, 'Setoran awal pokok');
            $savingsService->deposit($member, 'wajib', 50000, $member->join_date, 'Setoran awal wajib');
            $savingsService->deposit($member, 'sukarela', rand(100000, 1000000), $member->join_date, 'Setoran awal sukarela');
        }

        // 5. Create Loans & Schedules using Calculator
        $loanMembers = $members->random(5);
        foreach ($loanMembers as $member) {
            $amount = $this->faker()->randomElement([1000000, 2000000, 5000000, 10000000]);
            $interestRate = 1.5;
            $term = 12;
            $method = 'flat';

            // Gunakan Calculator agar Sinkron
            $calc = LoanCalculator::calculate($amount, $interestRate, $term, $method);

            $loan = Loan::create([
                'member_id' => $member->id,
                'amount' => $amount,
                'interest_rate' => $interestRate,
                'interest_method' => $method,
                'penalty_rate' => 0.1,
                'term_months' => $term,
                'monthly_installment' => $calc['monthly_total'],
                'status' => 'active',
                'apply_date' => now()->subMonths(3)->format('Y-m-d'),
                'approved_date' => now()->subMonths(3)->format('Y-m-d'),
            ]);

            // Record cash disbursement
            app(\App\Services\CashLedgerService::class)->record(
                $cashMain->id, (float) $loan->amount, 'expense', 'pencairan', "Pencairan #{$loan->id} - {$member->name}", $loan, $loan->approved_date
            );

            // Generate Schedules via Calculator
            $rows = LoanCalculator::generateScheduleRows($amount, $interestRate, $term, $calc['monthly_total'], $method, $loan->approved_date);
            
            foreach ($rows as $row) {
                $status = ($row['installment_number'] <= 2) ? 'paid' : 'pending';
                if (strtotime($row['due_date']) < time() && $status === 'pending') $status = 'overdue';

                $schedule = $loan->schedules()->create([
                    'installment_number' => $row['installment_number'],
                    'due_date' => $row['due_date'],
                    'principal_amount' => $row['principal_amount'],
                    'interest_amount' => $row['interest_amount'],
                    'total_due' => $row['total_due'],
                    'status' => $status,
                    'paid_at' => $status === 'paid' ? $row['due_date'] : null,
                ]);

                if ($status === 'paid') {
                    $repayment = $loan->repayments()->create([
                        'amount' => $row['total_due'],
                        'payment_date' => $row['due_date'],
                    ]);

                    // Update cash for repayment
                    app(\App\Services\CashLedgerService::class)->record(
                        $cashMain->id, (float) $row['total_due'], 'income', 'angsuran', "Angsuran #{$loan->id} - {$member->name}", $repayment, $row['due_date']
                    );
                }
            }
        }
    }

    private function faker() { return \Faker\Factory::create(); }
}
