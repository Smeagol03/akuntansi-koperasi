<?php

namespace App\Services;

use App\Models\CashAccount;
use App\Models\CashTransaction;
use App\Models\SavingTransaction;
use App\Models\LoanRepayment;
use App\Models\Loan;
use Illuminate\Support\Facades\DB;

class CashLedgerService
{
    public function __construct(
        protected AccountingService $accountingService
    ) {}

    /**
     * Catat mutasi kas/bank dengan Pessimistic Locking & Automatic Journaling.
     */
    public function record(
        int $accountId,
        float $amount,
        string $type,
        string $category,
        string $description,
        $reference = null,
        ?string $date = null
    ): CashTransaction {
        return DB::transaction(function () use ($accountId, $amount, $type, $category, $description, $reference, $date) {
            $date = $date ?? now()->toDateString();
            
            // 1. Lock baris rekening untuk keamanan saldo
            $account = CashAccount::where('id', $accountId)->lockForUpdate()->firstOrFail();

            // 2. Buat record mutasi kas
            $transaction = $account->transactions()->create([
                'amount' => $amount,
                'type' => $type,
                'category' => $category,
                'description' => $description,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference ? $reference->id : null,
                'transaction_date' => $date,
            ]);

            // 3. Update saldo rekening fisik
            if ($type === 'income') {
                $account->increment('balance', $amount);
            } else {
                $account->decrement('balance', $amount);
            }

            // 4. OTOMATISASI JURNAL AKUNTANSI (Double-Entry)
            $this->generateJournal($transaction, $account, $reference);

            return $transaction;
        });
    }

    /**
     * Logika Pemetaan Transaksi ke Jurnal Umum
     */
    private function generateJournal(CashTransaction $cashTrx, CashAccount $cashAcc, $reference)
    {
        $lines = [];
        $cashCoaCode = ($cashAcc->name === 'Rekening Bank') ? '1120' : '1110';
        $date = $cashTrx->transaction_date->toDateString();

        if ($cashTrx->category === 'simpanan') {
            // Mapping Akun Simpanan berdasarkan jenis rekening
            $savingAcc = $reference->account; 
            $savingCoaMap = [
                'pokok' => '3110',
                'wajib' => '3120',
                'sukarela' => '2210',
                'berjangka' => '2220',
            ];
            $targetCoa = $savingCoaMap[$savingAcc->type] ?? '2210';

            if ($cashTrx->type === 'income') {
                $lines[] = ['coa_code' => $cashCoaCode, 'debit' => $cashTrx->amount, 'credit' => 0];
                $lines[] = ['coa_code' => $targetCoa, 'debit' => 0, 'credit' => $cashTrx->amount];
            } else {
                $lines[] = ['coa_code' => $targetCoa, 'debit' => $cashTrx->amount, 'credit' => 0];
                $lines[] = ['coa_code' => $cashCoaCode, 'debit' => 0, 'credit' => $cashTrx->amount];
            }
        } 
        elseif ($cashTrx->category === 'pencairan') {
            // Pencairan Pinjaman: Debit Piutang, Kredit Kas
            $lines[] = ['coa_code' => '1310', 'debit' => $cashTrx->amount, 'credit' => 0];
            $lines[] = ['coa_code' => $cashCoaCode, 'debit' => 0, 'credit' => $cashTrx->amount];
        }
        elseif ($cashTrx->category === 'angsuran') {
            // Pembayaran Angsuran: Debit Kas, Kredit Piutang (Pokok) & Kredit Pendapatan (Bunga)
            // Untuk akurasi, kita ambil porsi bunga dari loan aslinya
            $loan = $reference->loan;
            $interestRatio = ($loan->monthly_installment > 0) 
                ? ($loan->monthly_installment - ($loan->amount / $loan->term_months)) / $loan->monthly_installment 
                : 0;
            
            $interestAmount = round($cashTrx->amount * $interestRatio, 2);
            $principalAmount = $cashTrx->amount - $interestAmount;

            $lines[] = ['coa_code' => $cashCoaCode, 'debit' => $cashTrx->amount, 'credit' => 0];
            $lines[] = ['coa_code' => '1310', 'debit' => 0, 'credit' => $principalAmount];
            $lines[] = ['coa_code' => '4110', 'debit' => 0, 'credit' => $interestAmount];
        }
        else {
            // Default: Beban Operasional
            if ($cashTrx->type === 'income') {
                $lines[] = ['coa_code' => $cashCoaCode, 'debit' => $cashTrx->amount, 'credit' => 0];
                $lines[] = ['coa_code' => '4200', 'debit' => 0, 'credit' => $cashTrx->amount];
            } else {
                $lines[] = ['coa_code' => '5200', 'debit' => $cashTrx->amount, 'credit' => 0];
                $lines[] = ['coa_code' => $cashCoaCode, 'debit' => 0, 'credit' => $cashTrx->amount];
            }
        }

        if (!empty($lines)) {
            $this->accountingService->createEntry($date, $cashTrx->description, $lines, $cashTrx);
        }
    }

    public function getMainAccount(): CashAccount
    {
        return CashAccount::where('name', 'Kas Utama')->first() 
            ?? CashAccount::create([
                'name' => 'Kas Utama',
                'type' => 'cash',
                'balance' => 0,
                'status' => 'active'
            ]);
    }
}
