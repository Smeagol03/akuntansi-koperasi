<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Models\SavingTransaction;
use App\Models\SavingAccount;
use App\Models\CashAccount;
use App\Models\Coa;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Dashboard statistik utama koperasi (API JSON)
     */
    public function dashboard()
    {
        return response()->json($this->getDashboardData());
    }

    /**
     * Render the Dashboard Inertia Page
     */
    public function dashboardView()
    {
        return Inertia::render('dashboard', $this->getDashboardData());
    }

    /**
     * Render the Reports Inertia Page
     */
    public function reportView()
    {
        // Rekap simpanan per bulan (12 bulan terakhir)
        $monthlySavings = SavingTransaction::selectRaw(
            "strftime('%Y-%m', transaction_date) as month,
             SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_setor,
             SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_tarik,
             COUNT(*) as jumlah_transaksi"
        )
            ->where('transaction_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("strftime('%Y-%m', transaction_date)")
            ->orderByRaw("strftime('%Y-%m', transaction_date)")
            ->get();

        // Rekap pinjaman per bulan (12 bulan terakhir)
        $monthlyLoans = DB::table('loans')
            ->selectRaw(
                "strftime('%Y-%m', apply_date) as month,
                 COUNT(*) as jumlah_pengajuan,
                 SUM(amount) as total_pokok,
                 SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as jumlah_aktif,
                 SUM(CASE WHEN status = 'paid_off' THEN 1 ELSE 0 END) as jumlah_lunas"
            )
            ->where('apply_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("strftime('%Y-%m', apply_date)")
            ->orderByRaw("strftime('%Y-%m', apply_date)")
            ->get();

        return Inertia::render('reports/index', [
            'monthly_savings' => $monthlySavings,
            'monthly_loans' => $monthlyLoans,
            'summary' => $this->getDashboardData(),
        ]);
    }

    /**
     * Get the unified dashboard data
     */
    private function getDashboardData()
    {
        // 1. Statistik Anggota
        $memberStats = DB::table('members')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
            ")->first();

        $members = [
            'total' => (int) $memberStats->total,
            'active' => (int) $memberStats->active,
            'inactive' => (int) $memberStats->inactive,
        ];

        // 2. Statistik Simpanan (Dari Rekening)
        $savingStats = DB::table('saving_accounts')
            ->selectRaw("
                SUM(CASE WHEN type = 'pokok' THEN balance ELSE 0 END) as total_pokok,
                SUM(CASE WHEN type = 'wajib' THEN balance ELSE 0 END) as total_wajib,
                SUM(CASE WHEN type = 'sukarela' THEN balance ELSE 0 END) as total_sukarela,
                SUM(balance) as grand_total
            ")->first();

        $savingsBalance = (float) ($savingStats->grand_total ?? 0);
        $savings = [
            'total_pokok' => (float) ($savingStats->total_pokok ?? 0),
            'total_wajib' => (float) ($savingStats->total_wajib ?? 0),
            'total_sukarela' => (float) ($savingStats->total_sukarela ?? 0),
            'grand_total' => $savingsBalance,
        ];

        // 3. Statistik Pinjaman
        $loanStats = DB::table('loans')
            ->selectRaw("
                SUM(CASE WHEN status IN ('active', 'paid_off') THEN amount ELSE 0 END) as total_disalurkan,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as total_aktif,
                SUM(CASE WHEN status = 'paid_off' THEN 1 ELSE 0 END) as total_lunas
            ")->first();

        $outstandingPrincipal = $this->calculateOutstandingPrincipal();
        $loans = [
            'total_disalurkan' => (float) ($loanStats->total_disalurkan ?? 0),
            'total_aktif' => (int) ($loanStats->total_aktif ?? 0),
            'total_lunas' => (int) ($loanStats->total_lunas ?? 0),
            'outstanding_principal' => $outstandingPrincipal,
        ];

        // 4. Perhitungan SHU (Dari Pendapatan Bunga)
        $shu = [
            'total_pendapatan_bunga' => $this->calculateTotalInterestEarned(),
        ];

        // 5. Rasio Keuangan & Monitoring Akun
        $cashBalance = (float) CashAccount::sum('balance');
        $overdueAmount = (float) LoanSchedule::overdue()->sum('total_due');
        
        $ratios = [
            'cash_on_hand' => $cashBalance,
            'npl' => $outstandingPrincipal > 0 ? round(($overdueAmount / $outstandingPrincipal) * 100, 2) : 0,
            'liquidity' => $savingsBalance > 0 ? round(($cashBalance / $savingsBalance) * 100, 2) : 0,
        ];

        // 6. Analitik Lanjutan: Komposisi Risiko Kredit
        $loanRiskComposition = [
            ['name' => 'Lancar', 'value' => (float) Loan::where('status', 'active')->whereDoesntHave('schedules', fn($q) => $q->overdue())->sum('amount')],
            ['name' => 'Dalam Perhatian', 'value' => (float) Loan::where('status', 'pending')->sum('amount')],
            ['name' => 'Macet (Overdue)', 'value' => (float) Loan::whereHas('schedules', fn($q) => $q->overdue())->sum('amount')],
        ];

        return [
            'members' => $members,
            'savings' => $savings,
            'loans' => $loans,
            'shu' => $shu,
            'ratios' => $ratios,
            'loan_risk' => $loanRiskComposition,
            'monthly_trends' => $this->getMonthlyTrends(),
            'last_transactions' => SavingTransaction::with('account.member')->latest()->take(5)->get(),
            'upcoming_installments' => LoanSchedule::with('loan.member')->upcoming(7)->get(),
            'overdue_installments' => LoanSchedule::with('loan.member')->overdue()->get(),
        ];
    }

    /**
     * Get monthly trends for charts (last 6 months)
     */
    private function getMonthlyTrends()
    {
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();

        $savings = DB::table('saving_transactions')
            ->selectRaw("strftime('%Y-%m', transaction_date) as month, SUM(amount) as total")
            ->where('transaction_date', '>=', $sixMonthsAgo)
            ->where('amount', '>', 0)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $loans = DB::table('loans')
            ->selectRaw("strftime('%Y-%m', apply_date) as month, SUM(amount) as total")
            ->where('apply_date', '>=', $sixMonthsAgo)
            ->whereIn('status', ['active', 'paid_off'])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $trends[] = [
                'month' => now()->subMonths($i)->translatedFormat('M Y'),
                'savings' => (float) ($savings->get($month)->total ?? 0),
                'loans' => (float) ($loans->get($month)->total ?? 0),
            ];
        }

        return $trends;
    }

    private function calculateOutstandingPrincipal()
    {
        $result = DB::table('loans')
            ->leftJoin('loan_repayments', 'loans.id', '=', 'loan_repayments.loan_id')
            ->where('loans.status', 'active')
            ->selectRaw('SUM(loans.monthly_installment * loans.term_months) - COALESCE(SUM(loan_repayments.amount), 0) as outstanding')
            ->value('outstanding');

        return (float) ($result ?? 0);
    }

    private function calculateTotalInterestEarned()
    {
        $result = DB::table('loan_repayments')
            ->join('loans', 'loan_repayments.loan_id', '=', 'loans.id')
            ->whereIn('loans.status', ['active', 'paid_off'])
            ->selectRaw('
                SUM(
                    loan_repayments.amount / loans.monthly_installment
                    * (loans.monthly_installment - (loans.amount / loans.term_months))
                ) as total_interest
            ')
            ->value('total_interest');

        return round((float) ($result ?? 0), 2);
    }
}
