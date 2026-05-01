<?php

use App\Models\CashAccount;
use App\Models\Member;
use App\Models\User;
use Database\Seeders\CoaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(CoaSeeder::class);
    CashAccount::updateOrCreate(['name' => 'Kas Utama'], ['type' => 'cash', 'balance' => 0, 'status' => 'active']);
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('can apply for a new loan via web route', function () {
    $member = Member::factory()->create();
    $loanData = [
        'member_number' => $member->member_number,
        'amount' => 1000000,
        'interest_rate' => 1, // 1% per month
        'interest_method' => 'flat',
        'penalty_rate' => 0.1,
        'term_months' => 10,
        'apply_date' => now()->format('Y-m-d'),
    ];

    $response = $this->post(route('web_loans_store'), $loanData);

    $response->assertRedirect();

    $this->assertDatabaseHas('loans', [
        'amount' => 1000000,
        'monthly_installment' => 110000, // (1jt/10) + (1jt * 0.01)
        'status' => 'pending',
    ]);
});

it('can approve a loan via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 1000000,
        'interest_rate' => 1,
        'interest_method' => 'flat',
        'term_months' => 10,
        'monthly_installment' => 110000,
        'apply_date' => '2023-01-01',
        'status' => 'pending',
    ]);

    $response = $this->patch(route('web_loans_update_status', $loan), ['status' => 'active']);

    $response->assertRedirect();

    $this->assertDatabaseHas('loans', [
        'id' => $loan->id,
        'status' => 'active',
    ]);
});

it('can pay loan installments and mark as paid off via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 1000000,
        'interest_rate' => 0, // No interest for easy math
        'interest_method' => 'flat',
        'term_months' => 1,
        'monthly_installment' => 1000000,
        'apply_date' => '2023-01-01',
        'status' => 'active',
    ]);

    $response = $this->post(route('web_loans_repay', $loan), [
        'amount' => 1000000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $response->assertRedirect();

    $loan->refresh();
    expect($loan->status)->toBe('paid_off');
});

it('can pay loan installment via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 2000000,
        'interest_rate' => 1,
        'interest_method' => 'flat',
        'term_months' => 2,
        'monthly_installment' => 1020000,
        'apply_date' => '2024-01-01',
        'status' => 'active',
    ]);

    $response = $this->post(route('web_loans_repay', $loan), [
        'amount' => 1020000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('loan_repayments', [
        'loan_id' => $loan->id,
        'amount' => 1020000,
    ]);
});

it('marks loan as paid_off when repaid in full via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 500000,
        'interest_rate' => 0,
        'interest_method' => 'flat',
        'term_months' => 1,
        'monthly_installment' => 500000,
        'apply_date' => '2024-01-01',
        'status' => 'active',
    ]);

    $this->post(route('web_loans_repay', $loan), [
        'amount' => 500000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $loan->refresh();
    expect($loan->status)->toBe('paid_off');
});

it('updates loan schedule status when repayment is made via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 1000000,
        'interest_rate' => 1,
        'interest_method' => 'flat',
        'term_months' => 2,
        'monthly_installment' => 510000,
        'apply_date' => '2024-01-01',
        'status' => 'active',
    ]);

    // Buat 2 jadwal angsuran
    $loan->schedules()->create([
        'installment_number' => 1,
        'due_date' => '2024-02-01',
        'principal_amount' => 500000,
        'interest_amount' => 10000,
        'total_due' => 510000,
        'status' => 'pending',
    ]);

    $loan->schedules()->create([
        'installment_number' => 2,
        'due_date' => '2024-03-01',
        'principal_amount' => 500000,
        'interest_amount' => 10000,
        'total_due' => 510000,
        'status' => 'pending',
    ]);

    // Bayar angsuran pertama
    $this->post(route('web_loans_repay', $loan), [
        'amount' => 510000,
        'payment_date' => '2024-02-01',
    ]);

    // Verifikasi: jadwal pertama jadi 'paid', kedua tetap 'pending'
    $schedules = $loan->schedules()->orderBy('installment_number')->get();

    expect($schedules[0]->status)->toBe('paid');
    expect((float) $schedules[0]->paid_amount)->toBe(510000.0);
    expect($schedules[0]->paid_at)->not->toBeNull();
    expect($schedules[1]->status)->toBe('pending');
});
