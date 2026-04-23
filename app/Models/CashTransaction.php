<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_account_id',
        'amount',
        'type',
        'category',
        'description',
        'reference_type',
        'reference_id',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(CashAccount::class, 'cash_account_id');
    }

    /**
     * Get the parent reference model (polymorphic).
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
