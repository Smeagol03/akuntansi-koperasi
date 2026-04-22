<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavingTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\SavingTransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'member_id',
        'amount',
        'type',
        'description',
        'transaction_date',
    ];

    /**
     * Get the member that owns the saving transaction.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
