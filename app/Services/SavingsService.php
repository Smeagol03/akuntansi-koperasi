<?php

namespace App\Services;

use App\Models\Member;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Models\SavingInterestConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SavingsService
{
    public function __construct(
        protected CashLedgerService $cashService
    ) {}

    /**
     * Setor tunai ke rekening anggota
     */
    public function deposit(Member $member, string $type, float $amount, string $date, string $description)
    {
        return DB::transaction(function () use ($member, $type, $amount, $date, $description) {
            $account = $this->getOrCreateAccount($member, $type);

            $transaction = $account->transactions()->create([
                'amount' => $amount,
                'transaction_date' => $date,
                'description' => $description,
            ]);

            $account->increment('balance', $amount);

            // Record to Cash Ledger
            $cashAccount = $this->cashService->getMainAccount();
            $this->cashService->record(
                $cashAccount->id,
                $amount,
                'income',
                'simpanan',
                "Setoran simpanan {$type} - {$member->name}",
                $transaction,
                $date
            );

            return $transaction;
        });
    }

    /**
     * Tarik tunai dari rekening anggota (Ditingkatkan: Validasi Saldo)
     */
    public function withdraw(Member $member, string $type, float $amount, string $date, string $description)
    {
        return DB::transaction(function () use ($member, $type, $amount, $date, $description) {
            $account = $this->getOrCreateAccount($member, $type);

            // VALIDASI: Saldo tidak boleh negatif
            if ($account->balance < $amount) {
                throw new InvalidArgumentException("Saldo tidak mencukupi! Saldo saat ini: " . number_format($account->balance));
            }

            $transaction = $account->transactions()->create([
                'amount' => -$amount, // Nilai negatif untuk penarikan
                'transaction_date' => $date,
                'description' => $description,
            ]);

            $account->decrement('balance', $amount);

            // Record to Cash Ledger
            $cashAccount = $this->cashService->getMainAccount();
            $this->cashService->record(
                $cashAccount->id,
                $amount,
                'expense',
                'simpanan',
                "Penarikan simpanan {$type} - {$member->name}",
                $transaction,
                $date
            );

            return $transaction;
        });
    }

    private function getOrCreateAccount(Member $member, string $type): SavingAccount
    {
        $account = $member->savingAccounts()->where('type', $type)->where('status', 'active')->first();

        if (!$account) {
            $config = SavingInterestConfig::where('type', $type)->first();
            $account = $member->savingAccounts()->create([
                'type' => $type,
                'account_number' => 'ACC-' . $member->id . '-' . strtoupper(substr($type, 0, 3)) . '-' . strtoupper(Str::random(4)),
                'interest_rate' => $config ? $config->interest_rate : 0,
                'opened_at' => now(),
                'balance' => 0,
                'status' => 'active',
            ]);
        }

        return $account;
    }
}
