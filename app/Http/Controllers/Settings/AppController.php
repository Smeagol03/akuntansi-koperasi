<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Coa;
use App\Models\CashAccount;
use App\Models\SavingInterestConfig;
use Database\Seeders\CoaSeeder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AppController extends Controller
{
    /**
     * Tampilkan halaman pengaturan aplikasi
     */
    public function edit()
    {
        $settings = AppSetting::all()->pluck('value', 'key');
        $savingConfigs = SavingInterestConfig::all();
        $hasCoa = Coa::count() > 0;

        return Inertia::render('settings/app', [
            'settings' => $settings,
            'saving_configs' => $savingConfigs,
            'system_status' => [
                'has_coa' => $hasCoa,
                'coa_count' => Coa::count(),
            ]
        ]);
    }

    /**
     * Perbarui pengaturan aplikasi & bunga
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_address' => 'required|string',
            'default_interest_method' => 'required|string|in:flat,effective',
            'default_penalty_rate' => 'required|numeric|min:0',
            'interest_rates' => 'required|array',
        ]);

        return DB::transaction(function() use ($validated) {
            // 1. Update App Settings (Nama & Alamat)
            foreach ($validated as $key => $value) {
                if ($key !== 'interest_rates') {
                    AppSetting::where('key', $key)->update(['value' => $value]);
                }
            }

            // 2. Update Saving Interest Configs (Suku Bunga)
            foreach ($validated['interest_rates'] as $type => $rate) {
                SavingInterestConfig::where('type', $type)->update(['interest_rate' => $rate]);
            }

            return redirect()->back();
        });
    }

    /**
     * Jalankan Inisialisasi Master Data via UI (Alternatif db:seed)
     */
    public function initialize()
    {
        return DB::transaction(function() {
            // Jalankan CoaSeeder
            $seeder = new CoaSeeder();
            $seeder->run();

            // Pastikan Setting Default Ada
            $defaultSettings = [
                ['key' => 'app_name', 'value' => 'Koperasi Merah Putih', 'type' => 'string'],
                ['key' => 'app_address', 'value' => 'Jalan Merdeka No. 1, Jakarta', 'type' => 'string'],
                ['key' => 'app_logo', 'value' => '/favicon.svg', 'type' => 'string'],
                ['key' => 'default_interest_method', 'value' => 'flat', 'type' => 'string'],
                ['key' => 'default_penalty_rate', 'value' => '0.1', 'type' => 'numeric'],
            ];
            foreach ($defaultSettings as $s) {
                AppSetting::updateOrCreate(['key' => $s['key']], $s);
            }

            // Pastikan Config Bunga Ada
            $configs = [
                ['type' => 'pokok', 'interest_rate' => 0],
                ['type' => 'wajib', 'interest_rate' => 0],
                ['type' => 'sukarela', 'interest_rate' => 4.5],
                ['type' => 'berjangka', 'interest_rate' => 7],
            ];
            foreach ($configs as $cfg) {
                SavingInterestConfig::updateOrCreate(['type' => $cfg['type']], $cfg);
            }

            // Pastikan Akun Kas Utama Ada
            CashAccount::updateOrCreate(['name' => 'Kas Utama'], ['type' => 'cash', 'balance' => 0, 'status' => 'active']);
            CashAccount::updateOrCreate(['name' => 'Rekening Bank'], ['type' => 'bank', 'account_number' => '-', 'balance' => 0, 'status' => 'active']);

            return redirect()->back();
        });
    }
}
