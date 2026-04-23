<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    /**
     * Render the Member Detailed Profile Page
     */
    public function showView(Member $member)
    {
        $member->load([
            'savings' => fn ($q) => $q->orderBy('transaction_date', 'desc')->take(10),
            'loans.schedules' => fn ($q) => $q->orderBy('installment_number', 'asc'),
            'loans.repayments' => fn ($q) => $q->orderBy('payment_date', 'desc'),
        ]);

        $summary = [
            'total_pokok' => $member->savings()->where('type', 'pokok')->sum('amount'),
            'total_wajib' => $member->savings()->where('type', 'wajib')->sum('amount'),
            'total_sukarela' => $member->savings()->where('type', 'sukarela')->sum('amount'),
            'grand_total_simpanan' => $member->savings()->sum('amount'),
            'pinjaman_aktif' => $member->loans()->where('status', 'active')->count(),
            'total_hutang' => $member->loans()->where('status', 'active')->get()->sum(fn ($loan) => $loan->remaining_amount),
        ];

        return Inertia::render('members/show', [
            'member' => $member,
            'summary' => $summary,
        ]);
    }

    /**
     * Render the Members Inertia Page
     */
    public function indexView(Request $request)
    {
        $query = Member::query()
            ->withSum('savings as total_simpanan', 'amount')
            ->withSum('loans as total_pinjaman', 'amount');

        // Pencarian Advanced
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('member_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('join_date', $request->date);
        }

        $members = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('members/index', [
            'members' => $members,
            'filters' => $request->only(['search', 'status', 'date']),
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Member::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->noContent();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'phone_number' => 'nullable|string',
            'join_date' => 'required|date',
            'status' => 'required|string|in:active,inactive',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $member = Member::create($validatedData);

        if ($request->wantsJson()) {
            return response()->json($member, 201);
        }

        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(Member $member)
    {
        return response()->json($member);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Member $member)
    {
        return response()->noContent();
    }

    /**
     * Update member from Web form (Inertia redirect response).
     */
    public function updateFromWeb(Request $request, Member $member)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone_number' => 'nullable|string|max:20',
            'join_date' => 'required|date',
            'status' => 'required|string|in:active,inactive',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $member->update($validatedData);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage (API).
     */
    public function update(Request $request, Member $member)
    {
        $validatedData = $request->validate([
            'member_number' => 'required|string|unique:members,member_number,'.$member->id,
            'name' => 'required|string',
            'address' => 'required|string',
            'phone_number' => 'nullable|string',
            'join_date' => 'required|date',
            'status' => 'required|string|in:active,inactive',
        ]);

        $member->update($validatedData);

        return response()->json($member);
    }

    /**
     * Remove member from Web (Inertia redirect response).
     */
    public function destroyFromWeb(Member $member)
    {
        $member->delete();

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage (API).
     */
    public function destroy(Member $member)
    {
        $member->delete();

        return response()->noContent(); // 204 No Content
    }
}
