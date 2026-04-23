<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'installment_number',
        'due_date',
        'principal_amount',
        'interest_amount',
        'total_due',
        'paid_amount',
        'penalty_amount',
        'status',
        'paid_at',
    ];

    /**
     * Get the loan that owns the schedule.
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * Scope: Angsuran yang akan datang (dalam X hari)
     */
    public function scopeUpcoming($query, $days = 7)
    {
        return $query->where('status', '!=', 'paid')
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays($days)->toDateString()]);
    }

    /**
     * Scope: Angsuran yang sudah terlewat (Overdue)
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'paid')
            ->where('due_date', '<', now()->toDateString());
    }
}
