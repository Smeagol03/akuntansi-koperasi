<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SavingTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingController extends Controller
{
    /**
     * Render the Savings Inertia Page
     */
    public function indexView(Request $request)
    {
        $query = SavingTransaction::with('member');

        // Pencarian Advanced
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('member_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('savings/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'date'])
        ]);
    }

    /**
     * Store saving from Web form using Member Number (KMP-XXXX)
     */
    public function storeFromWeb(Request $request)
    {
        $validatedData = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|in:pokok,wajib,sukarela',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validatedData['member_number'])->firstOrFail();

        $member->savings()->create([
            'amount' => $validatedData['amount'],
            'type' => $validatedData['type'],
            'description' => $validatedData['description'],
            'transaction_date' => $validatedData['transaction_date'],
        ]);

        return redirect()->back();
    }

    /**
     * Tarik simpanan sukarela dari Web form (amount negatif = penarikan)
     */
    public function withdrawFromWeb(Request $request)
    {
        $validatedData = $request->validate([
            'member_number' => 'required|string|exists:members,member_number',
            'amount' => 'required|numeric|min:1',
            'type' => 'required|string|in:sukarela',
            'description' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        $member = Member::where('member_number', $validatedData['member_number'])->firstOrFail();

        // Simpan sebagai nilai negatif untuk menandai penarikan
        $member->savings()->create([
            'amount' => -abs($validatedData['amount']),
            'type' => $validatedData['type'],
            'description' => $validatedData['description'] ?? 'Penarikan Simpanan',
            'transaction_date' => $validatedData['transaction_date'],
        ]);

        return redirect()->back();
    }

    /**
     * Display a listing of saving transactions for a member.
     */
    public function index(Member $member)
    {
        $transactions = $member->savings()->orderBy('transaction_date', 'desc')->get();

        $summary = [
            'total_pokok' => $member->savings()->where('type', 'pokok')->sum('amount'),
            'total_wajib' => $member->savings()->where('type', 'wajib')->sum('amount'),
            'total_sukarela' => $member->savings()->where('type', 'sukarela')->sum('amount'),
            'total_keseluruhan' => $member->savings()->sum('amount'),
        ];

        return response()->json([
            'member' => $member,
            'summary' => $summary,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Store a newly created saving transaction in storage.
     */
    public function store(Request $request, Member $member)
    {
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string|in:pokok,wajib,sukarela',
            'description' => 'nullable|string',
            'transaction_date' => 'required|date',
        ]);

        $transaction = $member->savings()->create($validatedData);

        return response()->json($transaction, 201);
    }
}
