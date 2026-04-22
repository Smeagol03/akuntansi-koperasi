# Rencana Implementasi Backend: Tahap 2 - Manajemen Simpanan

Ini adalah rencana teknis untuk mengimplementasikan backend dari fitur manajemen simpanan.

## 1. Persiapan Database
- **Buat Migrasi**: Jalankan `php artisan make:migration create_saving_transactions_table`.
- **Definisikan Skema**:
  - `id` (primary key)
  - `member_id` (foreign key ke members, constrained, cascade on delete)
  - `amount` (decimal 15,2)
  - `type` (string) // values: pokok, wajib, sukarela
  - `description` (string, nullable)
  - `transaction_date` (date)
  - `timestamps`

## 2. Model dan Factory
- **Buat Model**: Jalankan `php artisan make:model SavingTransaction -f`.
- **Relasi di Member.php**: Tambahkan `savings()` (hasMany).
- **Relasi di SavingTransaction.php**: Tambahkan `member()` (belongsTo).
- **Konfigurasi Factory**: Buat data dummy untuk transaksi simpanan.

## 3. Backend (Controller dan Route)
- **Buat Controller**: `php artisan make:controller SavingController --api`.
- **Definisikan Route**:
  - `Route::get('members/{member}/savings', [SavingController::class, 'index']);`
  - `Route::post('members/{member}/savings', [SavingController::class, 'store']);`
- **Implementasi Logika**:
  - `store()`: Validasi `amount`, `type`, dan `transaction_date`. Simpan transaksi.
  - `index()`: Tampilkan riwayat transaksi simpanan anggota beserta ringkasan saldo (total pokok, total wajib, total sukarela).

## 4. Testing
- **Buat Feature Test**: `php artisan make:test SavingManagementTest --pest`.
- **Tulis Tes**:
  - Tes setoran simpanan berhasil.
  - Tes validasi (misal: tipe simpanan harus valid).
  - Tes perhitungan ringkasan saldo anggota.
  - Tes akses hanya untuk pengguna terautentikasi.
