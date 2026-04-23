<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Services\SavingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingController extends Controller
{
    public function __construct(
        protected SavingsService $savingsService
    ) {}

    /**
     * Render the Savings Inertia Page
     */
    public function indexView(Request $request)
    {
        $query = SavingAccount::with('member');

        // Pencarian Advanced (berdasarkan nama anggota atau nomor rekening)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('account_number', 'like', "%{$search}%")
                  ->orWhereHas('member', function($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%")
                        ->orWhere('member_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $accounts = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('savings/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'type'])
        ]);
    }

    /**
     * Store saving from Web form using Member Number (KMP-XXXX)
     */
    public function storeFromWeb(Request $request)
    {
        $validatedData = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:pokok,wajib,sukarela,berjangka',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validatedData['member_number'])->firstOrFail();

        $this->savingsService->deposit(
            $member,
            $validatedData['type'],
            (float) $validatedData['amount'],
            $validatedData['transaction_date'],
            $validatedData['description']
        );

        return redirect()->back();
    }

    /**
     * Tarik simpanan sukarela dari Web form
     */
    public function withdrawFromWeb(Request $request)
    {
        $validatedData = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validatedData['member_number'])->firstOrFail();
        
        // Simpan sebagai nilai negatif melalui service
        $this->savingsService->deposit(
            $member,
            'sukarela',
            -(float) abs($validatedData['amount']),
            $validatedData['transaction_date'],
            $validatedData['description'] ?? 'Penarikan Simpanan'
        );

        return redirect()->back();
    }

    /**
     * Display a listing of saving transactions for a member.
     */
    public function index(Member $member)
    {
        $accounts = $member->savingAccounts()->with('transactions')->get();

        $summary = [
            'total_pokok' => $member->savingAccounts()->where('type', 'pokok')->sum('balance'),
            'total_wajib' => $member->savingAccounts()->where('type', 'wajib')->sum('balance'),
            'total_sukarela' => $member->savingAccounts()->where('type', 'sukarela')->sum('balance'),
            'total_keseluruhan' => $member->savingAccounts()->sum('balance'),
        ];

        return response()->json([
            'member' => $member,
            'summary' => $summary,
            'accounts' => $accounts,
        ]);
    }
}
