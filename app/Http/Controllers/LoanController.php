<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanController extends Controller
{
    /**
     * Render the Loans Inertia Page
     */
    public function indexView(Request $request)
    {
        $query = Loan::with('member', 'repayments');

        // Pencarian Advanced
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

        if ($request->filled('date')) {
            $query->whereDate('apply_date', $request->date);
        }

        $loans = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'status', 'date'])
        ]);
    }

    /**
     * Store loan application from Web form using Member Number (KMP-XXXX)
     */
    public function storeFromWeb(Request $request)
    {
        $validated = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:1000',
            'interest_rate' => 'required|numeric|min:0',
            'term_months' => 'required|integer|min:1',
            'apply_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validated['member_number'])->firstOrFail();

        // Hitung angsuran bulanan (Bunga Flat)
        $principal = $validated['amount'];
        $interestRate = $validated['interest_rate'] / 100;
        $term = $validated['term_months'];
        $monthlyInstallment = ($principal / $term) + ($principal * $interestRate);

        $member->loans()->create([
            'amount' => $principal,
            'interest_rate' => $validated['interest_rate'],
            'term_months' => $term,
            'monthly_installment' => $monthlyInstallment,
            'apply_date' => $validated['apply_date'],
            'status' => 'pending',
        ]);

        return redirect()->back();
    }

    /**
     * Bayar angsuran dari Web form (Inertia redirect response)
     */
    public function repayFromWeb(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $loan->repayments()->create($validated);

        // Jika sudah lunas, ubah status
        $loan->refresh();
        if ($loan->remaining_amount <= 0) {
            $loan->update(['status' => 'paid_off']);
        }

        return redirect()->back();
    }

    /**
     * Ajukan pinjaman baru (API JSON)
     */
    public function store(Request $request, Member $member)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'interest_rate' => 'required|numeric|min:0',
            'term_months' => 'required|integer|min:1',
            'apply_date' => 'required|date',
        ]);

        // Hitung angsuran bulanan (Bunga Flat)
        $principal = $validated['amount'];
        $interestRate = $validated['interest_rate'] / 100; // per bulan
        $term = $validated['term_months'];

        $monthlyInstallment = ($principal / $term) + ($principal * $interestRate);

        $loan = $member->loans()->create([
            'amount' => $principal,
            'interest_rate' => $validated['interest_rate'],
            'term_months' => $term,
            'monthly_installment' => $monthlyInstallment,
            'apply_date' => $validated['apply_date'],
            'status' => 'pending',
        ]);

        return response()->json($loan, 201);
    }

    /**
     * Ubah status pinjaman (Approve/Reject)
     */
    public function updateStatus(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected,active',
        ]);

        $data = ['status' => $validated['status']];
        
        if ($validated['status'] === 'approved' || $validated['status'] === 'active') {
            $data['approved_date'] = now()->format('Y-m-d');
        }

        $loan->update($data);

        if ($request->wantsJson()) {
            return response()->json($loan);
        }

        return redirect()->back();
    }

    /**
     * Bayar angsuran
     */
    public function repay(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $repayment = $loan->repayments()->create($validated);

        // Jika sudah lunas, ubah status
        if ($loan->remaining_amount <= 0) {
            $loan->update(['status' => 'paid_off']);
        }

        return response()->json($repayment, 201);
    }

    /**
     * Daftar pinjaman anggota
     */
    public function index(Member $member)
    {
        return response()->json($member->loans()->with('repayments')->get());
    }
}
