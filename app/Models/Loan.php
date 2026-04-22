<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'amount',
        'interest_rate',
        'term_months',
        'monthly_installment',
        'status',
        'apply_date',
        'approved_date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }

    /**
     * Hitung total yang harus dibayar (Pinjaman + Bunga)
     */
    public function getTotalToPayAttribute()
    {
        return $this->monthly_installment * $this->term_months;
    }

    /**
     * Hitung sisa hutang
     */
    public function getRemainingAmountAttribute()
    {
        $paid = $this->repayments()->sum('amount');
        return $this->total_to_pay - $paid;
    }
}
