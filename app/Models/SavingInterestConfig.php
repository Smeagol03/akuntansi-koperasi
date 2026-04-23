<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingInterestConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'interest_rate',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'interest_rate' => 'decimal:2',
    ];
}
