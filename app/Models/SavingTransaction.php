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
        'saving_account_id',
        'amount',
        'description',
        'transaction_date',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the account that owns the saving transaction.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(SavingAccount::class, 'saving_account_id');
    }
}
