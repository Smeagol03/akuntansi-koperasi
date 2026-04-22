<?php

use App\Models\Member;
use App\Models\User;
use App\Models\SavingTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('can record a new saving transaction for a member', function () {
    $member = Member::factory()->create();
    $savingData = [
        'amount' => 100000,
        'type' => 'pokok',
        'description' => 'Simpanan Pokok Awal',
        'transaction_date' => now()->format('Y-m-d'),
    ];

    $response = $this->postJson("/api/members/{$member->id}/savings", $savingData);

    $response->assertStatus(201)
        ->assertJsonFragment(['amount' => 100000, 'type' => 'pokok']);

    $this->assertDatabaseHas('saving_transactions', [
        'member_id' => $member->id,
        'amount' => 100000,
        'type' => 'pokok'
    ]);
});

it('can retrieve savings history and summary for a member', function () {
    $member = Member::factory()->create();
    
    // Create some transactions
    SavingTransaction::create([
        'member_id' => $member->id,
        'amount' => 500000,
        'type' => 'pokok',
        'transaction_date' => '2023-01-01',
    ]);

    SavingTransaction::create([
        'member_id' => $member->id,
        'amount' => 50000,
        'type' => 'wajib',
        'transaction_date' => '2023-02-01',
    ]);

    SavingTransaction::create([
        'member_id' => $member->id,
        'amount' => 20000,
        'type' => 'sukarela',
        'transaction_date' => '2023-02-15',
    ]);

    $response = $this->getJson("/api/members/{$member->id}/savings");

    $response->assertOk()
        ->assertJsonPath('summary.total_pokok', 500000)
        ->assertJsonPath('summary.total_wajib', 50000)
        ->assertJsonPath('summary.total_sukarela', 20000)
        ->assertJsonPath('summary.total_keseluruhan', 570000)
        ->assertJsonCount(3, 'transactions');
});

it('validates saving transaction data', function () {
    $member = Member::factory()->create();

    $response = $this->postJson("/api/members/{$member->id}/savings", [
        'amount' => -100, // Invalid amount
        'type' => 'invalid_type', // Invalid type
    ]);

    $response->assertJsonValidationErrors(['amount', 'type', 'transaction_date']);
});

it('can record a withdrawal saving transaction via web route', function () {
    $member = Member::factory()->create();

    $response = $this->post(route('web_savings_withdraw'), [
        'member_number' => $member->member_number,
        'amount' => 50000,
        'type' => 'sukarela',
        'transaction_date' => now()->format('Y-m-d'),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('saving_transactions', [
        'member_id' => $member->id,
        'amount' => -50000, // Negatif = penarikan
        'type' => 'sukarela',
    ]);
});
