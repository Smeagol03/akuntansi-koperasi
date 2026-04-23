<?php

namespace App\Models;

use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Member extends Model
{
    /** @use HasFactory<MemberFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'member_number',
        'name',
        'address',
        'phone_number',
        'join_date',
        'status',
        'profile_photo_path',
        'notes',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Member $member) {
            if (! $member->member_number) {
                $member->member_number = self::generateMemberNumber();
            }
        });
    }

    /**
     * Generate Nomor Anggota Otomatis (Format: KMP-YYYY-0001)
     */
    public static function generateMemberNumber(): string
    {
        $year = date('Y');
        $prefix = "KMP-{$year}-";

        $lastMember = self::where('member_number', 'like', "{$prefix}%")
            ->orderBy('member_number', 'desc')
            ->first();

        if (! $lastMember) {
            return "{$prefix}0001";
        }

        $lastNumber = (int) substr($lastMember->member_number, -4);
        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextNumber}";
    }

    /**
     * Get the saving accounts for the member.
     */
    public function savingAccounts(): HasMany
    {
        return $this->hasMany(SavingAccount::class);
    }

    /**
     * Get all saving transactions for the member through accounts.
     */
    public function savings(): HasManyThrough
    {
        return $this->hasManyThrough(SavingTransaction::class, SavingAccount::class);
    }

    /**
     * Get the loans for the member.
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
