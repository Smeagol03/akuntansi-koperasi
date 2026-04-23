<?php

namespace App\Services;

use App\Models\Member;
use App\Models\SavingAccount;
use App\Models\SavingInterestConfig;
use App\Models\SavingTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SavingsService
{
    public function __construct(
        protected CashLedgerService $cashService
    ) {}

    /**
     * Catat setoran simpanan anggota
     */
    public function deposit(Member $member, string $type, float $amount, string $date, ?string $description = null)
    {
        return DB::transaction(function () use ($member, $type, $amount, $date, $description) {
            $account = $this->getOrCreateAccount($member, $type);
            
            $transaction = $account->transactions()->create([
                'amount' => $amount,
                'transaction_date' => $date,
                'description' => $description ?? "Setoran simpanan {$type}",
            ]);

            // Update balance rekening simpanan
            $account->increment('balance', $amount);

            // REKONSILIASI KAS OTOMATIS
            $cashAccount = $this->cashService->getMainAccount();
            $this->cashService->record(
                $cashAccount->id,
                abs($amount),
                $amount > 0 ? 'income' : 'expense',
                'simpanan',
                ($amount > 0 ? "Setoran" : "Penarikan") . " simpanan {$type} - {$member->name}",
                $transaction,
                $date
            );

            return $transaction;
        });
    }

    /**
     * Ambil atau buat rekening berdasarkan jenis
     */
    public function getOrCreateAccount(Member $member, string $type)
    {
        $account = $member->savingAccounts()->where('type', $type)->where('status', 'active')->first();

        if (!$account) {
            $config = SavingInterestConfig::where('type', $type)->first();
            
            $account = $member->savingAccounts()->create([
                'type' => $type,
                'account_number' => $this->generateAccountNumber($member, $type),
                'interest_rate' => $config ? $config->interest_rate : 0,
                'opened_at' => now(),
                'balance' => 0,
                'status' => 'active',
            ]);
        }

        return $account;
    }

    /**
     * Generate nomor rekening unik
     */
    private function generateAccountNumber(Member $member, string $type)
    {
        $prefix = strtoupper(substr($type, 0, 3));
        return "ACC-{$member->id}-{$prefix}-" . Str::upper(Str::random(4));
    }

    /**
     * Perhitungan Bunga Bulanan
     */
    public function processMonthlyInterest()
    {
        $accounts = SavingAccount::where('status', 'active')
            ->where('interest_rate', '>', 0)
            ->where('balance', '>', 0)
            ->get();

        $count = 0;
        foreach ($accounts as $account) {
            DB::transaction(function () use ($account, &$count) {
                $interestAmount = round($account->balance * ($account->interest_rate / 100 / 12), 2);

                if ($interestAmount > 0) {
                    $transaction = $account->transactions()->create([
                        'amount' => $interestAmount,
                        'transaction_date' => now()->toDateString(),
                        'description' => "Bunga bulanan (" . date('F Y') . ")",
                    ]);

                    $account->increment('balance', $interestAmount);

                    // Catatan: Bunga simpanan biasanya BEBAN bagi koperasi (Kas Keluar) 
                    // tapi jika hanya pembukuan internal di buku tabungan, tidak selalu mengurangi kas fisik saat itu juga.
                    // Di sistem ini, bunga simpanan tidak otomatis mengurangi Kas Utama sampai ditarik oleh anggota.

                    $count++;
                }
            });
        }

        return $count;
    }
}
