<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use App\Models\CashTransaction;
use App\Services\CashLedgerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashController extends Controller
{
    public function __construct(
        protected CashLedgerService $cashService
    ) {}

    /**
     * Render the Cash & Bank Management Page
     */
    public function indexView(Request $request)
    {
        $accounts = CashAccount::withCount(['transactions'])->get();
        
        $query = CashTransaction::with(['account', 'reference']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }

        if ($request->filled('account_id')) {
            $query->where('cash_account_id', $request->account_id);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                             ->orderBy('id', 'desc')
                             ->paginate(15)
                             ->withQueryString();

        return Inertia::render('cash/index', [
            'accounts' => $accounts,
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'account_id'])
        ]);
    }

    /**
     * Catat mutasi manual (Biaya Operasional, dll)
     */
    public function storeMutasi(Request $request)
    {
        $validated = $request->validate([
            'cash_account_id' => 'required|exists:cash_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:income,expense',
            'category' => 'required|string|max:50',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        $this->cashService->record(
            $validated['cash_account_id'],
            (float) $validated['amount'],
            $validated['type'],
            $validated['category'],
            $validated['description'],
            null,
            $validated['transaction_date']
        );

        return redirect()->back();
    }
}
