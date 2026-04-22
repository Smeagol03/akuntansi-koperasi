<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SavingTransaction;
use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Http\Request;
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
     * Render the Reports Inertia Page dengan rekap bulanan
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
        $members = [
            'total' => Member::count(),
            'active' => Member::where('status', 'active')->count(),
            'inactive' => Member::where('status', 'inactive')->count(),
        ];

        // 2. Statistik Simpanan
        $savings = [
            'total_pokok' => SavingTransaction::where('type', 'pokok')->sum('amount'),
            'total_wajib' => SavingTransaction::where('type', 'wajib')->sum('amount'),
            'total_sukarela' => SavingTransaction::where('type', 'sukarela')->sum('amount'),
            'grand_total' => SavingTransaction::sum('amount'),
        ];

        // 3. Statistik Pinjaman
        $loans = [
            'total_disalurkan' => Loan::whereIn('status', ['active', 'paid_off', 'approved'])->sum('amount'),
            'total_aktif' => Loan::where('status', 'active')->count(),
            'total_lunas' => Loan::where('status', 'paid_off')->count(),
            'outstanding_principal' => $this->calculateOutstandingPrincipal(),
        ];

        // 4. Perhitungan SHU (Dari Pendapatan Bunga)
        // SHU didapat dari: Total Angsuran - Total Pokok yang dikembalikan
        $shu = [
            'total_pendapatan_bunga' => $this->calculateTotalInterestEarned(),
        ];

        return [
            'members' => $members,
            'savings' => $savings,
            'loans' => $loans,
            'shu' => $shu,
            'last_transactions' => SavingTransaction::with('member')->latest()->take(5)->get(),
        ];
    }

    /**
     * Menghitung sisa pokok pinjaman yang belum dibayar di seluruh koperasi
     */
    private function calculateOutstandingPrincipal()
    {
        $totalLoanAmount = Loan::where('status', 'active')->sum(DB::raw('monthly_installment * term_months'));
        $totalRepayments = LoanRepayment::whereHas('loan', function($q) {
            $q->where('status', 'active');
        })->sum('amount');

        return $totalLoanAmount - $totalRepayments;
    }

    /**
     * Menghitung pendapatan bunga yang sudah masuk (Laba)
     */
    private function calculateTotalInterestEarned()
    {
        // Untuk bunga flat, setiap pembayaran angsuran mengandung porsi bunga.
        // Porsi Bunga = Pinjaman Pokok * Rate %
        // Kita hitung dari semua repayment yang ada.
        
        $totalInterest = 0;
        $repayments = LoanRepayment::with('loan')->get();

        foreach ($repayments as $repayment) {
            $loan = $repayment->loan;
            $monthlyInterest = $loan->amount * ($loan->interest_rate / 100);
            
            // Karena ini bunga flat, kita asumsikan setiap angsuran membayar bunga secara proporsional
            // Jika bayar full satu angsuran, maka dapet bunga full sebulan.
            $proportion = $repayment->amount / $loan->monthly_installment;
            $totalInterest += $monthlyInterest * $proportion;
        }

        return round($totalInterest, 2);
    }
}
