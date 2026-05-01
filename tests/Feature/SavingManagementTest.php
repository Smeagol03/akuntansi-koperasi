<?php

use App\Models\CashAccount;
use App\Models\Member;
use App\Models\SavingAccount;
use App\Models\User;
use App\Services\SavingsService;
use Database\Seeders\CoaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(CoaSeeder::class);
    CashAccount::updateOrCreate(['name' => 'Kas Utama'], ['type' => 'cash', 'balance' => 0, 'status' => 'active']);
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('can record a deposit via web route', function () {
    $member = Member::factory()->create();

    $response = $this->post(route('web_savings_store'), [
        'member_number' => $member->member_number,
        'type' => 'pokok',
        'amount' => 100000,
        'transaction_date' => now()->format('Y-m-d'),
        'description' => 'Simpanan Pokok Awal',
    ]);

    $response->assertRedirect();

    // Verifikasi akun simpanan terbuat dan saldo terisi
    $this->assertDatabaseHas('saving_accounts', [
        'member_id' => $member->id,
        'type' => 'pokok',
        'balance' => 100000,
    ]);

    // Verifikasi transaksi tercatat
    $account = SavingAccount::where('member_id', $member->id)->where('type', 'pokok')->first();
    $this->assertDatabaseHas('saving_transactions', [
        'saving_account_id' => $account->id,
        'amount' => 100000,
    ]);
});

it('can accumulate multiple deposits for a member', function () {
    $member = Member::factory()->create();
    $savingsService = app(SavingsService::class);

    // Setoran pertama
    $savingsService->deposit($member, 'pokok', 500000, now()->format('Y-m-d'), 'Pokok 1');
    $savingsService->deposit($member, 'wajib', 50000, now()->format('Y-m-d'), 'Wajib 1');
    $savingsService->deposit($member, 'sukarela', 20000, now()->format('Y-m-d'), 'Sukarela 1');

    // Verifikasi saldo akun
    expect(SavingAccount::where('member_id', $member->id)->where('type', 'pokok')->first()->balance)->toBe('500000.00');
    expect(SavingAccount::where('member_id', $member->id)->where('type', 'wajib')->first()->balance)->toBe('50000.00');
    expect(SavingAccount::where('member_id', $member->id)->where('type', 'sukarela')->first()->balance)->toBe('20000.00');
});

it('validates saving deposit data via web route', function () {
    $member = Member::factory()->create();

    $response = $this->post(route('web_savings_store'), [
        'member_number' => $member->member_number,
        'amount' => -100, // Invalid amount
        'type' => 'invalid_type', // Invalid type
        'transaction_date' => '', // Missing date
    ]);

    $response->assertSessionHasErrors(['amount', 'type', 'transaction_date']);
});

it('can record a withdrawal saving transaction via web route', function () {
    $member = Member::factory()->create();
    $savingsService = app(SavingsService::class);

    // Pertama, setor dulu agar ada saldo
    $savingsService->deposit($member, 'sukarela', 100000, now()->format('Y-m-d'), 'Setor awal');

    $response = $this->post(route('web_savings_withdraw'), [
        'member_number' => $member->member_number,
        'amount' => 50000,
        'type' => 'sukarela',
        'transaction_date' => now()->format('Y-m-d'),
    ]);

    $response->assertRedirect();

    // Verifikasi saldo berkurang
    $account = SavingAccount::where('member_id', $member->id)->where('type', 'sukarela')->first();
    expect($account->balance)->toBe('50000.00');

    // Verifikasi transaksi penarikan tercatat (negatif)
    $this->assertDatabaseHas('saving_transactions', [
        'saving_account_id' => $account->id,
        'amount' => -50000,
    ]);
});
