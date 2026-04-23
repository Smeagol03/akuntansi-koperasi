<?php

namespace App\Console\Commands;

use App\Models\LoanSchedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CalculateLoanPenalties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loans:calculate-penalties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hitung denda keterlambatan untuk angsuran pinjaman yang melewati jatuh tempo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        // Ambil jadwal yang belum lunas dan sudah lewat jatuh tempo
        $overdueSchedules = LoanSchedule::with('loan')
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', $today->toDateString())
            ->get();

        $count = 0;

        foreach ($overdueSchedules as $schedule) {
            $loan = $schedule->loan;

            // Jika loan tidak punya rate denda, lewati
            if ($loan->penalty_rate <= 0) {
                // Tetap tandai overdue jika belum
                if ($schedule->status !== 'overdue') {
                    $schedule->update(['status' => 'overdue']);
                }

                continue;
            }

            $dueDate = Carbon::parse($schedule->due_date);
            $daysOverdue = $dueDate->diffInDays($today);

            // Rumus: (Pokok Angsuran * % Denda / 100) * Jumlah Hari Terlambat
            $penalty = ($schedule->principal_amount * ($loan->penalty_rate / 100)) * $daysOverdue;

            $schedule->update([
                'penalty_amount' => round($penalty, 2),
                'status' => 'overdue',
            ]);

            $count++;
        }

        $this->info("Berhasil memproses {$count} angsuran macet dan memperbarui denda.");
    }
}
