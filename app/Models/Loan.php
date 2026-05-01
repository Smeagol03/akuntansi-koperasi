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
        'interest_method',
        'penalty_rate',
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

    public function schedules(): HasMany
    {
        return $this->hasMany(LoanSchedule::class);
    }

    /**
     * Hitung total yang harus dibayar (Pinjaman + Bunga)
     */
    public function getTotalToPayAttribute()
    {
        // Gunakan jadwal angsuran jika tersedia (akurat untuk flat & efektif)
        $scheduleTotal = $this->schedules()->sum('total_due');

        if ($scheduleTotal > 0) {
            return (float) $scheduleTotal;
        }

        // Fallback untuk pinjaman yang belum punya jadwal
        return $this->monthly_installment * $this->term_months;
    }

    /**
     * Hitung sisa hutang (total yang harus dibayar - yang sudah dibayar)
     */
    public function getRemainingAmountAttribute()
    {
        $paid = $this->repayments()->sum('amount');

        return $this->total_to_pay - $paid;
    }
}
