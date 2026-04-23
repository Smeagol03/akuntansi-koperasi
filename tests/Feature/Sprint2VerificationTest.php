<?php

use App\Models\Member;
use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('sprint 2: financial calculations verification', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $member = Member::factory()->create();
    
    // 1. UJI BUNGA FLAT (5jt, 1.5%, 12bln)
    // Angsuran = (5.000.000 / 12) + (5.000.000 * 0.015) = 416.666,6 + 75.000 = 491.666,6 -> Round: 491.667
    $this->actingAs($admin)->post(route('web_loans_store'), [
        'member_number' => $member->member_number,
        'amount' => 5000000,
        'interest_rate' => 1.5,
        'interest_method' => 'flat',
        'penalty_rate' => 0.1,
        'term_months' => 12,
        'apply_date' => now()->toDateString(),
    ]);

    $loanFlat = Loan::where('interest_method', 'flat')->first();
    expect((int)$loanFlat->monthly_installment)->toBe(491667);
    
    // Approve to generate schedule
    $this->patch(route('web_loans_update_status', ['loan' => $loanFlat->id]), ['status' => 'active']);
    
    $scheduleFlat = $loanFlat->schedules()->first();
    expect((int)$scheduleFlat->total_due)->toBe(491667);
    expect((int)$scheduleFlat->interest_amount)->toBe(75000);
    expect((int)$scheduleFlat->principal_amount)->toBe(416667);

    // 2. UJI BUNGA EFEKTIF / ANUITAS (10jt, 1%, 12bln)
    // Angsuran = 888.488
    $this->actingAs($admin)->post(route('web_loans_store'), [
        'member_number' => $member->member_number,
        'amount' => 10000000,
        'interest_rate' => 1,
        'interest_method' => 'effective',
        'penalty_rate' => 0.1,
        'term_months' => 12,
        'apply_date' => now()->toDateString(),
    ]);

    $loanEff = Loan::where('interest_method', 'effective')->first();
    expect((int)$loanEff->monthly_installment)->toBe(888488);
    
    $this->patch(route('web_loans_update_status', ['loan' => $loanEff->id]), ['status' => 'active']);
    
    $firstScheduleEff = $loanEff->schedules()->where('installment_number', 1)->first();
    expect((int)$firstScheduleEff->interest_amount)->toBe(100000); // 1% dari 10jt
    expect((int)$firstScheduleEff->total_due)->toBe(888488);
});
