<?php

use App\Models\Member;
use App\Models\User;
use App\Models\Loan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('can apply for a new loan and calculate monthly installment', function () {
    $member = Member::factory()->create();
    $loanData = [
        'amount' => 1000000,
        'interest_rate' => 1, // 1% per month
        'term_months' => 10,
        'apply_date' => now()->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/members/{$member->id}/loans", $loanData);

    $response->assertStatus(201)
        ->assertJsonFragment([
            'amount' => 1000000,
            'monthly_installment' => 110000, // (1jt/10) + (1jt * 0.01)
            'status' => 'pending'
        ]);
});

it('can approve a loan', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 1000000,
        'interest_rate' => 1,
        'term_months' => 10,
        'monthly_installment' => 110000,
        'apply_date' => '2023-01-01',
        'status' => 'pending',
    ]);

    $response = $this->patchJson("/api/loans/{$loan->id}/status", ['status' => 'active']);

    $response->assertOk()
        ->assertJsonFragment(['status' => 'active']);

    $this->assertDatabaseHas('loans', [
        'id' => $loan->id,
        'status' => 'active'
    ]);
});

it('can pay loan installments and mark as paid off', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 1000000,
        'interest_rate' => 0, // No interest for easy math
        'term_months' => 1,
        'monthly_installment' => 1000000,
        'apply_date' => '2023-01-01',
        'status' => 'active',
    ]);

    // Pay full amount
    $response = $this->postJson("/api/loans/{$loan->id}/repay", [
        'amount' => 1000000,
        'payment_date' => now()->format('Y-m-d'),
    ]);

    $response->assertStatus(201);

    $loan->refresh();
    expect($loan->status)->toBe('paid_off');
});

it('can pay loan installment via web route', function () {
    $member = Member::factory()->create();
    $loan = $member->loans()->create([
        'amount' => 2000000,
        'interest_rate' => 1,
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
