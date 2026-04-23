<?php

namespace Database\Seeders;

use App\Models\Coa;
use Illuminate\Database\Seeder;

class CoaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // ASET (1xxx)
            ['code' => '1110', 'name' => 'Kas Utama', 'type' => 'asset'],
            ['code' => '1120', 'name' => 'Rekening Bank', 'type' => 'asset'],
            ['code' => '1310', 'name' => 'Piutang Pinjaman Anggota', 'type' => 'asset'],

            // KEWAJIBAN (2xxx)
            ['code' => '2210', 'name' => 'Simpanan Sukarela', 'type' => 'liability'],
            ['code' => '2220', 'name' => 'Simpanan Berjangka', 'type' => 'liability'],

            // EKUITAS / MODAL (3xxx)
            ['code' => '3110', 'name' => 'Simpanan Pokok', 'type' => 'equity'],
            ['code' => '3120', 'name' => 'Simpanan Wajib', 'type' => 'equity'],
            ['code' => '3300', 'name' => 'SHU Berjalan', 'type' => 'equity'],

            // PENDAPATAN (4xxx)
            ['code' => '4110', 'name' => 'Pendapatan Bunga Pinjaman', 'type' => 'income'],
            ['code' => '4200', 'name' => 'Pendapatan Lain-lain', 'type' => 'income'],

            // BEBAN (5xxx)
            ['code' => '5110', 'name' => 'Beban Bunga Simpanan', 'type' => 'expense'],
            ['code' => '5200', 'name' => 'Beban Operasional', 'type' => 'expense'],
        ];

        foreach ($accounts as $account) {
            Coa::updateOrCreate(['code' => $account['code']], $account);
        }
    }
}
