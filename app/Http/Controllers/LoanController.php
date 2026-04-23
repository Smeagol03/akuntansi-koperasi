<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Member;
use App\Models\LoanSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\CashLedgerService;
use App\Services\LoanCalculator;

class LoanController extends Controller
{
    public function __construct(
        protected CashLedgerService $cashService
    ) {}

    /**
     * Render the Loans Inertia Page
     */
    public function indexView(Request $request)
    {
        $query = Loan::with('member', 'repayments');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('member_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $loans = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * Render the Global Loan Schedules (Tagihan) Page
     */
    public function schedulesView(Request $request)
    {
        $query = LoanSchedule::with('loan.member');

        // Filter berdasarkan pencarian nama/nomor anggota
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('loan.member', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('member_number', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status (Ditingkatkan: Mendukung 'overdue')
        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'overdue') {
                $query->where('status', '!=', 'paid')
                      ->where('due_date', '<', now()->toDateString());
            } else {
                $query->where('status', $status);
            }
        }

        // Filter berdasarkan bulan jatuh tempo
        if ($request->filled('month')) {
            $date = date_create($request->month . '-01');
            $query->whereMonth('due_date', $date->format('m'))
                  ->whereYear('due_date', $date->format('Y'));
        }

        // Penyortiran Default (Jatuh tempo terdekat)
        $schedules = $query->orderBy('due_date', 'asc')->paginate(15)->withQueryString();

        return Inertia::render('loans/schedules', [
            'schedules' => $schedules,
            'filters' => $request->only(['search', 'status', 'month'])
        ]);
    }

    /**
     * Export Loan Schedule to PDF
     */
    public function exportSchedule(Loan $loan)
    {
        $loan->load(['member', 'schedules' => fn($q) => $q->orderBy('installment_number', 'asc')]);
        $pdf = Pdf::loadView('exports.loan-schedule', compact('loan'));
        return $pdf->download("Jadwal_Angsuran_{$loan->member->member_number}.pdf");
    }

    /**
     * Store loan application from Web form
     */
    public function storeFromWeb(Request $request)
    {
        $validated = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:1000',
            'interest_rate' => 'required|numeric|min:0',
            'interest_method' => 'required|string|in:flat,effective',
            'penalty_rate' => 'required|numeric|min:0',
            'term_months' => 'required|integer|min:1',
            'apply_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validated['member_number'])->firstOrFail();

        $financials = LoanCalculator::calculate(
            (float) $validated['amount'], 
            (float) $validated['interest_rate'], 
            (int) $validated['term_months'], 
            $validated['interest_method']
        );

        $member->loans()->create([
            'amount' => $validated['amount'],
            'interest_rate' => $validated['interest_rate'],
            'interest_method' => $validated['interest_method'],
            'penalty_rate' => $validated['penalty_rate'],
            'term_months' => $validated['term_months'],
            'monthly_installment' => $financials['monthly_total'],
            'apply_date' => $validated['apply_date'],
            'status' => 'pending',
        ]);

        return redirect()->back();
    }

    /**
     * Bayar angsuran dari Web form
     */
    public function repayFromWeb(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $repayment = $loan->repayments()->create($validated);
        
        $cashAccount = $this->cashService->getMainAccount();
        $this->cashService->record(
            $cashAccount->id,
            (float) $validated['amount'],
            'income',
            'angsuran',
            "Pembayaran angsuran #{$loan->id} - {$loan->member->name}",
            $repayment,
            $validated['payment_date']
        );

        $loan->refresh();
        if ($loan->remaining_amount <= 0) {
            $loan->update(['status' => 'paid_off']);
        }

        return redirect()->back();
    }

    /**
     * Ubah status pinjaman
     */
    public function updateStatus(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected,active',
        ]);

        $oldStatus = $loan->status;
        $newStatus = $validated['status'];
        $data = ['status' => $newStatus];
        
        if ($newStatus === 'approved' || $newStatus === 'active') {
            $data['approved_date'] = now()->format('Y-m-d');
            if ($loan->schedules()->count() === 0) {
                $this->generateLoanSchedules($loan, $data['approved_date']);
            }

            if ($oldStatus !== 'active' && $newStatus === 'active') {
                $cashAccount = $this->cashService->getMainAccount();
                $this->cashService->record(
                    $cashAccount->id,
                    (float) $loan->amount,
                    'expense',
                    'pencairan',
                    "Pencairan pinjaman #{$loan->id} - {$loan->member->name}",
                    $loan,
                    now()->toDateString()
                );
            }
        }

        $loan->update($data);
        return redirect()->back();
    }

    private function generateLoanSchedules(Loan $loan, $startDate)
    {
        $rows = LoanCalculator::generateScheduleRows(
            (float) $loan->amount, 
            (float) $loan->interest_rate, 
            (int) $loan->term_months, 
            (int) $loan->monthly_installment, 
            $loan->interest_method, 
            $startDate
        );

        foreach ($rows as $row) {
            $loan->schedules()->create([
                'installment_number' => $row['installment_number'],
                'due_date' => $row['due_date'],
                'principal_amount' => $row['principal_amount'],
                'interest_amount' => $row['interest_amount'],
                'total_due' => $row['total_due'],
                'status' => 'pending',
            ]);
        }
    }

    /**
     * API JSON Endpoints tetap dipertahankan
     */
    public function index(Member $member) { return response()->json($member->loans()->with('schedules', 'repayments')->get()); }
    public function store(Request $request, Member $member) { /* ... */ }
    public function repay(Request $request, Loan $loan) { /* ... */ }
}
