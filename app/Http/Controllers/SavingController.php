<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Services\SavingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class SavingController extends Controller
{
    public function __construct(
        protected SavingsService $savingsService
    ) {}

    /**
     * Display a listing of savings accounts.
     */
    public function indexView(Request $request)
    {
        $query = SavingAccount::with('member');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('member_number', 'like', "%{$search}%");
            })->orWhere('account_number', 'like', "%{$search}%");
        }

        $accounts = $query->paginate(15)->withQueryString();

        return Inertia::render('savings/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Handle savings deposit from web form.
     */
    public function storeFromWeb(Request $request)
    {
        $validated = $request->validate([
            'member_number' => 'required|exists:members,member_number',
            'type' => 'required|in:pokok,wajib,sukarela,berjangka',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $member = Member::where('member_number', $validated['member_number'])->firstOrFail();

        $this->savingsService->deposit(
            $member,
            $validated['type'],
            (float) $validated['amount'],
            $validated['transaction_date'],
            $validated['description'] ?? "Setoran simpanan {$validated['type']}"
        );

        return redirect()->back();
    }

    /**
     * Handle savings withdrawal from web form.
     */
    public function withdrawFromWeb(Request $request)
    {
        $validated = $request->validate([
            'member_number' => 'required|exists:members,member_number',
            'type' => 'required|in:pokok,wajib,sukarela,berjangka',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $member = Member::where('member_number', $validated['member_number'])->firstOrFail();

        try {
            $this->savingsService->withdraw(
                $member,
                $validated['type'],
                (float) $validated['amount'],
                $validated['transaction_date'],
                $validated['description'] ?? "Penarikan simpanan {$validated['type']}"
            );
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]);
        }

        return redirect()->back();
    }

    // API methods kept for potential future use
    public function index(Member $member) { return response()->json($member->savingAccounts()->with('transactions')->get()); }
}
