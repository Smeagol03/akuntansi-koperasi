<?php

use App\Models\Member;
use App\Models\User;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\SavingTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('calculates dashboard statistics correctly', function () {
    // 1. Create Member
    $member = Member::factory()->create(['status' => 'active']);

    // 2. Create Saving
    SavingTransaction::create([
        'member_id' => $member->id,
        'amount' => 500000,
        'type' => 'pokok',
        'transaction_date' => now()->format('Y-m-d'),
    ]);

    // 3. Create Loan (1jt, 10bln, 1% interest = 110k/bln)
    $loan = Loan::create([
        'member_id' => $member->id,
        'amount' => 1000000,
        'interest_rate' => 1,
        'term_months' => 10,
        'monthly_installment' => 110000,
        'apply_date' => '2023-01-01',
        'status' => 'active',
    ]);

    // 4. Pay 1 installment (110k)
    // Interest portion should be 1% of 1jt = 10k
    LoanRepayment::create([
        'loan_id' => $loan->id,
        'amount' => 110000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $response = $this->getJson('/api/dashboard');

    $response->assertOk()
        ->assertJsonPath('members.total', 1)
        ->assertJsonPath('savings.grand_total', 500000)
        ->assertJsonPath('shu.total_pendapatan_bunga', 10000)
        ->assertJsonPath('loans.outstanding_principal', 990000); // (110k * 10) - 110k
});
