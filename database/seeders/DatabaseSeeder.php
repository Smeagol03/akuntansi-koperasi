<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use App\Models\CashAccount;
use App\Models\Loan;
use App\Models\Member;
use App\Models\SavingInterestConfig;
use App\Models\User;
use App\Services\CashLedgerService;
use App\Services\LoanCalculator;
use App\Services\SavingsService;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // BAGIAN 1: DATA MASTER (WAJIB UNTUK SISTEM)
        // ==========================================

        // 1.1 Bagan Akun (COA) - Jantung Akuntansi
        $this->call(CoaSeeder::class);

        // 1.2 Pengaturan Aplikasi & Branding
        $this->seedMasterSettings();

        // 1.3 Konfigurasi Jenis Simpanan & Bunga
        $this->seedSavingConfigs();

        // 1.4 Akun Kas & Bank Utama
        $this->seedInitialCashAccounts();

        // 1.5 Admin Utama (Optional, bisa buat lewat Register juga)
        if (User::count() === 0) {
            User::factory()->create([
                'name' => 'Admin Koperasi',
                'email' => 'admin@koperasi.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
        }

        // ==========================================
        // BAGIAN 2: DATA DUMMY / CONTOH (OPSIONAL)
        // ==========================================
        // Hapus atau beri komentar pada baris di bawah ini jika ingin database "BERSIH"

        $this->seedSampleData();
    }

    private function seedMasterSettings()
    {
        $settings = [
            ['key' => 'app_name', 'value' => 'Koperasi Merah Putih', 'type' => 'string'],
            ['key' => 'app_address', 'value' => 'Jalan Merdeka No. 1, Jakarta', 'type' => 'string'],
            ['key' => 'app_logo', 'value' => '/favicon.svg', 'type' => 'string'],
            ['key' => 'default_interest_method', 'value' => 'flat', 'type' => 'string'],
            ['key' => 'default_penalty_rate', 'value' => '0.1', 'type' => 'numeric'],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }

    private function seedSavingConfigs()
    {
        $configs = [
            ['type' => 'pokok', 'interest_rate' => 0],
            ['type' => 'wajib', 'interest_rate' => 0],
            ['type' => 'sukarela', 'interest_rate' => 4.5],
            ['type' => 'berjangka', 'interest_rate' => 7],
        ];

        foreach ($configs as $cfg) {
            SavingInterestConfig::updateOrCreate(['type' => $cfg['type']], $cfg);
        }
    }

    private function seedInitialCashAccounts()
    {
        CashAccount::updateOrCreate(['name' => 'Kas Utama'], ['type' => 'cash', 'balance' => 0, 'status' => 'active']);
        CashAccount::updateOrCreate(['name' => 'Rekening Bank'], ['type' => 'bank', 'account_number' => '00123456789', 'balance' => 0, 'status' => 'active']);
    }

    private function seedSampleData()
    {
        // Hanya jalankan jika di lingkungan lokal/testing
        if (! app()->environment('local')) {
            return;
        }

        $members = Member::factory()->count(10)->create();
        $savingsService = app(SavingsService::class);
        $cashMain = CashAccount::where('name', 'Kas Utama')->first();

        // 1. Setoran Awal Simpanan Pokok & Wajib
        foreach ($members as $member) {
            $savingsService->deposit($member, 'pokok', 100000, $member->join_date, 'Setoran awal pokok');
            $savingsService->deposit($member, 'wajib', 50000, $member->join_date, 'Setoran awal wajib');
        }

        // 2. Buat Pinjaman untuk 5 anggota pertama
        $loanMembers = $members->take(5);
        foreach ($loanMembers as $member) {
            // Buat pinjaman active
            $loan = Loan::factory()->create([
                'member_id' => $member->id,
                'status' => 'active',
                'apply_date' => now()->subMonths(3)->format('Y-m-d'),
                'approved_date' => now()->subMonths(3)->addDays(2)->format('Y-m-d'),
            ]);

            // Catat pencairan ke kas
            $cashLedger = app(CashLedgerService::class);
            $cashLedger->record(
                $cashMain->id,
                $loan->amount,
                'expense',
                'pencairan',
                "Pencairan pinjaman #{$loan->id} - {$member->name}",
                $loan,
                $loan->approved_date
            );

            // Generate jadwal
            $rows = LoanCalculator::generateScheduleRows(
                (float) $loan->amount,
                (float) $loan->interest_rate,
                (int) $loan->term_months,
                (float) $loan->monthly_installment,
                $loan->interest_method,
                $loan->approved_date
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

            // Simulasi pembayaran 2 bulan pertama
            $schedulesToPay = $loan->schedules()->orderBy('installment_number')->take(2)->get();
            foreach ($schedulesToPay as $schedule) {
                // Buat repayment record
                $repayment = $loan->repayments()->create([
                    'amount' => $schedule->total_due,
                    'payment_date' => $schedule->due_date,
                    'description' => "Pembayaran angsuran ke-{$schedule->installment_number}",
                ]);

                // Update schedule
                $schedule->update([
                    'status' => 'paid',
                    'paid_amount' => $schedule->total_due,
                    'paid_at' => $schedule->due_date,
                ]);

                // Jurnal kas untuk angsuran
                $cashLedger->record(
                    $cashMain->id,
                    $schedule->total_due,
                    'income',
                    'angsuran',
                    "Pembayaran angsuran #{$loan->id} - {$member->name}",
                    $repayment,
                    $schedule->due_date
                );
            }
        }
    }

    private function faker()
    {
        return Factory::create();
    }
}
