# Roadmap Pengembangan Lanjutan: KoperasiKu

> **Status saat ini (MVP)**: Anggota CRUD, Simpanan Setoran/Tarik, Pinjaman + Angsuran, Laporan Rekap Bulanan, Dashboard KPI.

---

## Visi Pengembangan

Mengembangkan KoperasiKu dari **pencatat transaksi sederhana** menjadi **sistem akuntansi koperasi terintegrasi** yang mengikuti standar akuntansi koperasi Indonesia (PSAK/ISAK), lengkap dengan analisis keuangan otomatis, pelaporan regulasi, dan manajemen operasional end-to-end.

---

## Arsitektur Data yang Diperlukan

```
Anggota ──────┬──► SavingAccount (rekening simpanan per anggota per jenis)
              │         └──► SavingTransaction (riwayat transaksi + bunga)
              │
              ├──► Loan (pinjaman)
              │         ├──► LoanSchedule (jadwal angsuran per bulan)
              │         └──► LoanRepayment (pembayaran + denda)
              │
              └──► MemberEquity (modal anggota = simpanan pokok)

Koperasi ─────┬──► CashAccount (rekening kas/bank)
              │         └──► CashTransaction (mutasi kas)
              │
              ├──► JournalEntry (jurnal akuntansi)
              │         └──► JournalLine (debit/kredit per akun)
              │
              └──► ChartOfAccounts (bagan akun)
```

---

## MODUL 1 — Profil Anggota Lengkap 🧑
**Prioritas: Tinggi | Kompleksitas: Sedang**

Halaman detail per anggota yang menampilkan semua data secara terintegrasi.

### Fitur
- **Kartu Anggota Digital** — foto profil, nomor anggota, QR code
- **Ringkasan Posisi Keuangan** — total simpanan per jenis, total hutang aktif, saldo bersih
- **Tab Riwayat Lengkap**:
  - Semua simpanan (setoran + penarikan, terfilter per jenis)
  - Semua pinjaman (aktif + historis)
  - Jadwal angsuran pinjaman aktif
  - Timeline aktivitas
- **Cetak Buku Tabungan** — format PDF rekap simpanan per anggota

### Database Baru
```
// Tidak perlu tabel baru, cukup relasi yang dioptimasi
// Tambahkan profile_photo ke tabel members
members: +profile_photo, +notes, +emergency_contact
```

### Routes Baru
```
GET /members/{member}          → MemberController@show
GET /members/{member}/statement → MemberController@statement (PDF)
```

---

## MODUL 2 — Simpanan Lanjutan 💰
**Prioritas: Tinggi | Kompleksitas: Sedang-Tinggi**

### 2a. Rekening Simpanan (SavingAccount)
Pisahkan konsep "rekening" dari "transaksi" untuk tracking saldo yang akurat.

```sql
saving_accounts:
  id, member_id, type (pokok/wajib/sukarela/berjangka),
  balance (saldo terkini — computed/cached),
  interest_rate (% per tahun, khusus sukarela & berjangka),
  opened_at, closed_at, status (active/closed)
```

### 2b. Bunga Simpanan Otomatis
- Konfigurasi tingkat bunga per jenis simpanan di settings
- **Job terjadwal** (bulanan) menghitung dan membukukan bunga simpanan sukarela
- Riwayat pembayaran bunga tercatat sebagai transaksi bertype `interest`

### 2c. Simpanan Berjangka (Deposito)
- Tenor: 3, 6, 12 bulan
- Tingkat bunga lebih tinggi dari sukarela
- Pencairan otomatis atau rollover saat jatuh tempo
- Notifikasi 7 hari sebelum jatuh tempo

### Database Baru
```sql
saving_accounts (rekening per anggota per jenis)
saving_interest_configs (konfigurasi bunga per jenis)
```

---

## MODUL 3 — Pinjaman Lanjutan 📋
**Prioritas: Tinggi | Kompleksitas: Tinggi**

### 3a. Jadwal Angsuran (Amortization Schedule)
Saat pinjaman disetujui, sistem **generate jadwal angsuran lengkap**:

```sql
loan_schedules:
  id, loan_id, installment_number,
  due_date, principal_amount, interest_amount,
  total_due, paid_amount, penalty_amount,
  status (pending/paid/partial/overdue), paid_at
```

Tampilan: tabel jadwal angsuran per pinjaman dengan progress bar pelunasan.

### 3b. Metode Bunga
- **Flat** (sudah ada) — bunga dihitung dari pokok awal
- **Efektif/Anuitas** — bunga dihitung dari sisa pokok (lebih adil)
- Pilihan di form pengajuan, simulasi interaktif keduanya

### 3c. Denda Keterlambatan
```sql
loan_schedules: +penalty_rate (% per hari), +days_overdue
```
- Job terjadwal harian mengecek jadwal yang melewati `due_date`
- Denda = `days_overdue × penalty_rate × outstanding_amount`
- Tombol "Bayar" di jadwal langsung mengisi total_due + denda

### 3d. Notifikasi Jatuh Tempo
- Dashboard alert: daftar angsuran jatuh tempo minggu ini
- (Future) Email/WhatsApp reminder

### 3e. Riwayat Pembayaran Per Pinjaman
- Halaman detail pinjaman: jadwal + riwayat pembayaran side-by-side
- Status per cicilan: Lunas / Sebagian / Belum Bayar / Telat

---

## MODUL 4 — Kas & Bank 🏦
**Prioritas: Sedang | Kompleksitas: Sedang**

Tracking arus kas koperasi secara independen dari transaksi anggota.

### 4a. Akun Kas/Bank
```sql
cash_accounts:
  id, name (Kas Utama / BRI / Mandiri), type (cash/bank),
  balance, account_number, status
```

### 4b. Mutasi Kas
```sql
cash_transactions:
  id, cash_account_id, type (income/expense),
  category (simpanan_masuk/angsuran_masuk/operasional/dll),
  amount, description, transaction_date, reference_id (polimorfik)
```

### 4c. Rekonsiliasi
- Kas masuk: otomatis dicatat saat anggota setor simpanan / bayar angsuran
- Kas keluar: saat koperasi cairkan pinjaman / bayar bunga simpanan
- Manual entry untuk biaya operasional (listrik, gaji, ATK, dll)
- Laporan mutasi kas harian/mingguan/bulanan

---

## MODUL 5 — Jurnal & Buku Besar (Double-Entry) 📒
**Prioritas: Sedang | Kompleksitas: Sangat Tinggi**

Opsional tapi sangat penting untuk koperasi yang butuh laporan keuangan formal.

### 5a. Bagan Akun (Chart of Accounts)
```
ASET
  1100 - Kas
  1200 - Bank
  1300 - Piutang Pinjaman Anggota
  1400 - Piutang Bunga

KEWAJIBAN & EKUITAS
  2100 - Simpanan Pokok
  2200 - Simpanan Wajib
  2300 - Simpanan Sukarela
  3100 - Modal Koperasi (SHU ditahan)

PENDAPATAN
  4100 - Pendapatan Bunga Pinjaman
  4200 - Pendapatan Administrasi

BEBAN
  5100 - Beban Bunga Simpanan
  5200 - Beban Operasional
```

### 5b. Jurnal Otomatis
Setiap transaksi anggota **otomatis membuat jurnal**:
```
Anggota setor simpanan wajib Rp100.000:
  D: Kas          100.000
  K: Simpanan Wajib 100.000

Anggota bayar angsuran Rp1.020.000 (pokok 1jt + bunga 20rb):
  D: Kas          1.020.000
  K: Piutang        1.000.000
  K: Pendapatan Bunga 20.000
```

### 5c. Laporan Keuangan Standar
- **Neraca Saldo** (Trial Balance)
- **Neraca** (Balance Sheet)
- **Laporan SHU** (setara Laporan Laba Rugi koperasi)
- **Laporan Arus Kas** (Cash Flow Statement)

---

## MODUL 6 — Analitik & Dashboard Lanjutan 📊
**Prioritas: Sedang | Kompleksitas: Sedang**

### 6a. Dashboard Charts (menggunakan Recharts/Chart.js)
- **Line Chart**: Tren simpanan vs pinjaman 12 bulan
- **Bar Chart**: Angsuran diterima per bulan
- **Donut Chart**: Komposisi simpanan (pokok/wajib/sukarela)
- **Area Chart**: Pertumbuhan anggota aktif

### 6b. Rasio Keuangan Koperasi
```
NPL (Non-Performing Loan) = pinjaman macet / total pinjaman aktif
CAR                       = modal / aktiva tertimbang
ROA                       = SHU / total aset
Rasio Likuiditas          = kas & bank / kewajiban jangka pendek
```

### 6c. Distribusi SHU
- Kalkulasi SHU akhir tahun berdasarkan:
  - Jasa anggota (proporsional simpanan)
  - Jasa usaha (proporsional pinjaman)
- Laporan distribusi per anggota
- Cetak tanda terima SHU

---

## MODUL 7 — Export & Cetak 🖨️
**Prioritas: Sedang | Kompleksitas: Sedang**

- **PDF**: Buku tabungan anggota, Jadwal angsuran, Laporan bulanan, Neraca
- **Excel**: Semua data tabel (via Laravel Excel / Spatie)
- **Print-friendly**: Semua halaman laporan ada versi cetak

---

## MODUL 8 — Administrasi Sistem ⚙️
**Prioritas: Rendah | Kompleksitas: Rendah-Sedang**

### 8a. Pengaturan Koperasi
```
settings:
  koperasi_name, koperasi_address, koperasi_logo
  interest_rate_default, penalty_rate_default
  fiscal_year_start, currency_symbol
```

### 8b. Manajemen User & Role
- Role: `super_admin`, `admin`, `kasir`, `viewer`
- Permission per role (CRUD per modul)
- Log aktivitas user (audit trail)

### 8c. Backup & Restore
- Export seluruh database ke JSON/SQL
- Jadwal backup otomatis

---

## Urutan Pengembangan yang Disarankan

```
Sprint 1 (1-2 minggu)
├── Modul 1: Profil Anggota Lengkap
└── Modul 3a: Jadwal Angsuran (LoanSchedule)

Sprint 2 (2-3 minggu)
├── Modul 3b-e: Metode bunga, denda, notifikasi
└── Modul 7: Export PDF dasar (jadwal + rekap anggota)

Sprint 3 (2-3 minggu)
├── Modul 2: Simpanan Lanjutan + bunga otomatis
└── Modul 6a: Dashboard charts

Sprint 4 (3-4 minggu)
├── Modul 4: Kas & Bank
└── Modul 6b-c: Rasio keuangan + distribusi SHU

Sprint 5 (4-6 minggu)
├── Modul 5: Jurnal & Buku Besar (Double-Entry)
└── Modul 8: Administrasi Sistem

Sprint 6 (2 minggu)
└── QA, performance optimization, production deployment
```

---

## Dependensi Teknis Tambahan

| Kebutuhan | Package | Alasan |
|-----------|---------|--------|
| Export Excel | `maatwebsite/excel` | Export data ke .xlsx |
| PDF | `barryvdh/laravel-dompdf` | Cetak dokumen, buku tabungan |
| Charts | `recharts` (npm) | Visualisasi data di React |
| Job Scheduler | Laravel Scheduler (sudah ada) | Hitung bunga & denda otomatis |
| Notifikasi | `laravel/notifications` | Alert jatuh tempo |
| Activity Log | `spatie/laravel-activitylog` | Audit trail |

---

## Catatan Skalabilitas

- Semua perhitungan finansial menggunakan **integer** (sen/rupiah penuh), bukan float
- Setiap perubahan saldo dicatat sebagai **event immutable** (append-only log)
- Jurnal otomatis harus dalam **database transaction** agar konsisten
- Indeks database pada kolom `member_id`, `status`, `due_date`, `transaction_date`

---

> **Mulai dari mana?**  
> Rekomendasikan mulai dari **Sprint 1** — Profil Anggota + Jadwal Angsuran.  
> Ini memberikan dampak paling terlihat bagi pengguna (kasir) tanpa merombak arsitektur yang ada.
