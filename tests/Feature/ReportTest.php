<?php

use App\Models\CashAccount;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Member;
use App\Models\User;
use App\Services\LoanCalculator;
use App\Services\SavingsService;
use Database\Seeders\CoaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(CoaSeeder::class);
    CashAccount::updateOrCreate(['name' => 'Kas Utama'], ['type' => 'cash', 'balance' => 0, 'status' => 'active']);
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('calculates dashboard statistics correctly', function () {
    // 1. Create Member
    $member = Member::factory()->create(['status' => 'active']);

    // 2. Create Saving via service (uses new account-based schema)
    $savingsService = app(SavingsService::class);
    $savingsService->deposit($member, 'pokok', 500000, now()->format('Y-m-d'), 'Setoran pokok');

    // 3. Create Loan (1jt, 10bln, 1% bunga flat = 110k/bln)
    $loan = Loan::create([
        'member_id' => $member->id,
        'amount' => 1000000,
        'interest_rate' => 1,
        'interest_method' => 'flat',
        'term_months' => 10,
        'monthly_installment' => 110000,
        'apply_date' => '2023-01-01',
        'status' => 'active',
    ]);

    // 4. Generate jadwal angsuran agar perhitungan outstanding & bunga akurat
    $rows = LoanCalculator::generateScheduleRows(1000000, 1, 10, 110000, 'flat', '2023-01-01');
    foreach ($rows as $row) {
        $loan->schedules()->create([
            'installment_number' => $row['installment_number'],
            'due_date' => $row['due_date'],
            'principal_amount' => $row['principal_amount'],
            'interest_amount' => $row['interest_amount'],
            'total_due' => $row['total_due'],
            'status' => 'pending',
        ]);
    }

    // 5. Pay 1 installment (110k) & mark schedule as paid
    LoanRepayment::create([
        'loan_id' => $loan->id,
        'amount' => 110000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $schedule = $loan->schedules()->orderBy('installment_number')->first();
    $schedule->update([
        'status' => 'paid',
        'paid_amount' => 110000,
        'paid_at' => now()->format('Y-m-d'),
    ]);

    $response = $this->getJson('/api/dashboard');

    $response->assertSuccessful()
        ->assertJsonPath('members.total', 1)
        ->assertJsonPath('savings.grand_total', 500000)
        ->assertJsonPath('shu.total_pendapatan_bunga', 10000) // interest_amount dari schedule
        ->assertJsonPath('loans.outstanding_principal', 900000); // 1jt - 100k pokok (dari schedule)
});
