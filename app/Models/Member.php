<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    /** @use HasFactory<\Database\Factories\MemberFactory> */
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
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Member $member) {
            if (!$member->member_number) {
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

        if (!$lastMember) {
            return "{$prefix}0001";
        }

        $lastNumber = (int) substr($lastMember->member_number, -4);
        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextNumber}";
    }

    /**
     * Get the saving transactions for the member.
     */
    public function savings(): HasMany
    {
        return $this->hasMany(SavingTransaction::class);
    }

    /**
     * Get the loans for the member.
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
