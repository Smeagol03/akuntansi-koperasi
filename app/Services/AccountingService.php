<?php

namespace App\Services;

use App\Models\Coa;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AccountingService
{
    /**
     * Membuat Jurnal Umum secara manual atau otomatis.
     * 
     * @param string $date Tanggal jurnal
     * @param string $description Keterangan transaksi
     * @param array $lines Daftar baris jurnal: [['coa_code' => '1110', 'debit' => 1000, 'credit' => 0], ...]
     * @param mixed $reference Model referensi (optional)
     */
    public function createEntry(string $date, string $description, array $lines, $reference = null): JournalEntry
    {
        return DB::transaction(function () use ($date, $description, $lines, $reference) {
            $totalDebit = 0;
            $totalCredit = 0;

            // 1. Buat Header Jurnal
            $entry = JournalEntry::create([
                'date' => $date,
                'description' => $description,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference ? $reference->id : null,
            ]);

            // 2. Buat Detail Jurnal (Lines)
            foreach ($lines as $line) {
                $coa = Coa::where('code', $line['coa_code'])->first();
                
                if (!$coa) {
                    throw new InvalidArgumentException("Kode Akun (COA) '{$line['coa_code']}' tidak ditemukan.");
                }

                $debit = (float) ($line['debit'] ?? 0);
                $credit = (float) ($line['credit'] ?? 0);

                $entry->lines()->create([
                    'coa_id' => $coa->id,
                    'debit' => $debit,
                    'credit' => $credit,
                ]);

                $totalDebit += $debit;
                $totalCredit += $credit;
            }

            // 3. Validasi Keseimbangan (Debit harus sama dengan Kredit)
            if (abs($totalDebit - $totalCredit) > 0.01) {
                throw new InvalidArgumentException("Jurnal tidak seimbang! Total Debit ({$totalDebit}) != Total Kredit ({$totalCredit}).");
            }

            return $entry;
        });
    }

    /**
     * Helper untuk mendapatkan COA berdasarkan kode
     */
    public function getCoa(string $code)
    {
        return Coa::where('code', $code)->first();
    }
}
