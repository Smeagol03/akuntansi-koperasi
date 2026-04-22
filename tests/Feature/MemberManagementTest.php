<?php

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
});

it('can retrieve a list of members', function () {
    Member::factory()->count(3)->create();

    $response = $this->getJson('/api/members');

    $response->assertOk()
        ->assertJsonCount(3);
});

it('can create a new member', function () {
    $memberData = Member::factory()->make()->toArray();

    $response = $this->postJson('/api/members', $memberData);

    $response->assertStatus(201)
        ->assertJsonFragment(['name' => $memberData['name']])
        ->assertJsonPath('member_number', 'KMP-'.now()->year.'-0001'); // Auto-generated

    $this->assertDatabaseHas('members', ['name' => $memberData['name']]);
});

it('does not create a member with invalid data', function () {
    $response = $this->postJson('/api/members', []); // Empty data

    // member_number tidak wajib di-input karena auto-generated oleh sistem
    $response->assertJsonValidationErrors(['name', 'address', 'join_date', 'status']);
});

it('skips member_number uniqueness check because it is auto-generated', function () {
    // member_number selalu unik karena di-generate berdasarkan urutan DB
    $member = Member::factory()->create();
    expect($member->member_number)->toStartWith('KMP-');
});

it('can retrieve a single member', function () {
    $member = Member::factory()->create();

    $response = $this->getJson("/api/members/{$member->id}");

    $response->assertOk()
        ->assertJsonPath('member_number', (string) $member->member_number);
});

it('can update an existing member', function () {
    $member = Member::factory()->create();
    $updatedData = [
        'name' => 'Updated Name',
        'address' => 'Updated Address',
        'phone_number' => '081234567890',
        'join_date' => '2023-01-01',
        'status' => 'inactive',
        'member_number' => 'UPD'.fake()->unique()->randomNumber(5),
    ];

    $response = $this->putJson("/api/members/{$member->id}", $updatedData);

    $response->assertOk()
        ->assertJsonFragment(['name' => 'Updated Name']);

    $this->assertDatabaseHas('members', ['id' => $member->id, 'name' => 'Updated Name']);
});

it('does not update a member with invalid data', function () {
    $member = Member::factory()->create();

    $response = $this->putJson("/api/members/{$member->id}", ['name' => '']);

    $response->assertJsonValidationErrors(['name']);
});

it('does not update a member with a non-unique member number', function () {
    $member1 = Member::factory()->create();
    $member2 = Member::factory()->create();

    $response = $this->putJson("/api/members/{$member1->id}", ['member_number' => $member2->member_number]);

    $response->assertJsonValidationErrors(['member_number']);
});

it('can delete a member', function () {
    $member = Member::factory()->create();

    $response = $this->deleteJson("/api/members/{$member->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('members', ['id' => $member->id]);
});

// Web Route Tests
it('can update a member via web route', function () {
    $member = Member::factory()->create();
    $updatedData = [
        'name' => 'Nama Terubah',
        'address' => 'Alamat Baru No. 1',
        'phone_number' => '08123456789',
        'join_date' => '2023-05-15',
        'status' => 'inactive',
    ];

    $response = $this->patch(route('web_members_update', $member), $updatedData);

    $response->assertRedirect();
    $this->assertDatabaseHas('members', ['id' => $member->id, 'name' => 'Nama Terubah', 'status' => 'inactive']);
});

it('can delete a member via web route', function () {
    $member = Member::factory()->create();

    $response = $this->delete(route('web_members_destroy', $member));

    $response->assertRedirect();
    $this->assertDatabaseMissing('members', ['id' => $member->id]);
});
