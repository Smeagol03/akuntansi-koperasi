<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Models\SavingInterestConfig;
use App\Models\CashAccount;
use App\Models\AppSetting;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Services\LoanCalculator;
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

    /**
     * Logika untuk mengisi data contoh (Dummy)
     */
    private function seedSampleData()
    {
        // Hanya jalankan jika di lingkungan lokal/testing
        if (!app()->environment('local')) return;

        $members = Member::factory()->count(10)->create();
        $savingsService = app(\App\Services\SavingsService::class);
        $cashMain = CashAccount::where('name', 'Kas Utama')->first();

        foreach ($members as $member) {
            $savingsService->deposit($member, 'pokok', 100000, $member->join_date, 'Setoran awal pokok');
            $savingsService->deposit($member, 'wajib', 50000, $member->join_date, 'Setoran awal wajib');
        }
    }

    private function faker() { return \Faker\Factory::create(); }
}
