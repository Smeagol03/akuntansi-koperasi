<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'type',
        'account_number',
        'balance',
        'interest_rate',
        'opened_at',
        'closed_at',
        'status',
    ];

    protected $casts = [
        'opened_at' => 'date',
        'closed_at' => 'date',
        'balance' => 'decimal:2',
        'interest_rate' => 'decimal:2',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(SavingTransaction::class);
    }
}
