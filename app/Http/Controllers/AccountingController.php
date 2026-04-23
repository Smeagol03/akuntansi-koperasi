<?php

namespace App\Http\Controllers;

use App\Models\Coa;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AccountingController extends Controller
{
    /**
     * Tampilkan Daftar Jurnal Umum
     */
    public function journalsView(Request $request)
    {
        $query = JournalEntry::with(['lines.coa']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $journals = $query->orderBy('date', 'desc')
                          ->orderBy('id', 'desc')
                          ->paginate(15)
                          ->withQueryString();

        return Inertia::render('accounting/journals', [
            'journals' => $journals,
            'filters' => $request->only(['search', 'date'])
        ]);
    }

    /**
     * Tampilkan Buku Besar (Ledger) per Akun
     */
    public function ledgerView(Request $request)
    {
        $coas = Coa::orderBy('code')->get();
        $selectedCoaId = $request->coa_id ?? $coas->first()?->id;

        $lines = [];
        if ($selectedCoaId) {
            $lines = JournalLine::with('entry')
                ->where('coa_id', $selectedCoaId)
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->orderBy('journal_entries.date', 'asc')
                ->orderBy('journal_lines.id', 'asc')
                ->select('journal_lines.*')
                ->get();
            
            // Hitung Saldo Berjalan (Running Balance)
            $balance = 0;
            $coa = Coa::find($selectedCoaId);
            $isAssetOrExpense = in_array($coa->type, ['asset', 'expense']);

            foreach ($lines as $line) {
                if ($isAssetOrExpense) {
                    $balance += ($line->debit - $line->credit);
                } else {
                    $balance += ($line->credit - $line->debit);
                }
                $line->running_balance = $balance;
            }
        }

        return Inertia::render('accounting/ledger', [
            'coas' => $coas,
            'selected_coa_id' => (int) $selectedCoaId,
            'lines' => $lines
        ]);
    }

    /**
     * Laporan Keuangan (Neraca & Laba Rugi)
     */
    public function reportsView()
    {
        // Ambil Saldo Akhir setiap COA
        $balances = Coa::withSum('journalLines as total_debit', 'debit')
                       ->withSum('journalLines as total_credit', 'credit')
                       ->get()
                       ->map(function($coa) {
                           $isAssetOrExpense = in_array($coa->type, ['asset', 'expense']);
                           $coa->balance = $isAssetOrExpense 
                               ? ($coa->total_debit - $coa->total_credit)
                               : ($coa->total_credit - $coa->total_debit);
                           return $coa;
                       });

        // 1. Neraca (Balance Sheet)
        $assets = $balances->where('type', 'asset');
        $liabilities = $balances->where('type', 'liability');
        $equity = $balances->where('type', 'equity');

        // 2. Laba Rugi (Income Statement)
        $income = $balances->where('type', 'income');
        $expenses = $balances->where('type', 'expense');
        $netIncome = $income->sum('balance') - $expenses->sum('balance');

        return Inertia::render('accounting/reports', [
            'balance_sheet' => [
                'assets' => $assets->values(),
                'liabilities' => $liabilities->values(),
                'equity' => $equity->values(),
                'total_assets' => $assets->sum('balance'),
                'total_liabilities_equity' => $liabilities->sum('balance') + $equity->sum('balance') + $netIncome,
            ],
            'income_statement' => [
                'income' => $income->values(),
                'expenses' => $expenses->values(),
                'net_profit_loss' => $netIncome,
            ]
        ]);
    }
}
