<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Jadwal Angsuran - {{ $loan->member->member_number }}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #f59e0b; text-transform: uppercase; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .section-title { background: #fef3c7; padding: 8px; font-weight: bold; border-left: 4px solid #f59e0b; margin: 20px 0 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 5px; vertical-align: top; }
        .info-table td.label { width: 150px; color: #666; }
        .schedule-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .schedule-table th { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .schedule-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .footer { margin-top: 50px; width: 100%; }
        .footer td { width: 50%; text-align: center; }
        .signature-space { height: 80px; }
    </style>
</head>
<body>
    @php
        $appName = \App\Models\AppSetting::getVal('app_name', 'Koperasi Merah Putih');
        $appAddress = \App\Models\AppSetting::getVal('app_address', 'Sistem Akuntansi Koperasi Terintegrasi');
    @endphp
    <div class="header">
        <h1>{{ $appName }}</h1>
        <p>{{ $appAddress }}</p>
    </div>

    <div class="section-title">Informasi Anggota & Pinjaman</div>
    <table class="info-table">
        <tr>
            <td class="label">Nama Anggota</td>
            <td class="font-bold">: {{ $loan->member->name }}</td>
            <td class="label">Pokok Pinjaman</td>
            <td class="font-bold">: Rp {{ number_format($loan->amount, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">No. Anggota</td>
            <td class="font-bold">: {{ $loan->member->member_number }}</td>
            <td class="label">Tenor / Bunga</td>
            <td class="font-bold">: {{ $loan->term_months }} Bulan ({{ $loan->interest_rate }}% - {{ strtoupper($loan->interest_method) }})</td>
        </tr>
        <tr>
            <td class="label">Tanggal Cair</td>
            <td class="font-bold">: {{ \Carbon\Carbon::parse($loan->approved_date)->format('d/m/Y') }}</td>
            <td class="label">Angsuran / Bln</td>
            <td class="font-bold" style="color: #f59e0b">: Rp {{ number_format($loan->monthly_installment, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="section-title">Jadwal Angsuran Bulanan</div>
    <table class="schedule-table">
        <thead>
            <tr>
                <th width="30">Ke</th>
                <th>Jatuh Tempo</th>
                <th class="text-right">Pokok</th>
                <th class="text-right">Bunga</th>
                <th class="text-right">Total Tagihan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($loan->schedules as $schedule)
            <tr>
                <td style="text-align: center;">{{ $schedule->installment_number }}</td>
                <td>{{ \Carbon\Carbon::parse($schedule->due_date)->format('d M Y') }}</td>
                <td class="text-right">{{ number_format($schedule->principal_amount, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($schedule->interest_amount, 0, ',', '.') }}</td>
                <td class="text-right font-bold">{{ number_format($schedule->total_due, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background: #f9fafb;">
                <td colspan="2" class="text-right font-bold">TOTAL</td>
                <td class="text-right font-bold">{{ number_format($loan->amount, 0, ',', '.') }}</td>
                <td class="text-right font-bold">{{ number_format($loan->schedules->sum('interest_amount'), 0, ',', '.') }}</td>
                <td class="text-right font-bold" style="background: #fef3c7; border: 1px solid #f59e0b;">Rp {{ number_format($loan->schedules->sum('total_due'), 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <table class="footer">
        <tr>
            <td>
                <p>Anggota,</p>
                <div class="signature-space"></div>
                <p class="font-bold">( {{ $loan->member->name }} )</p>
            </td>
            <td>
                <p>Jakarta, {{ date('d F Y') }}<br>Pengurus Koperasi,</p>
                <div class="signature-space"></div>
                <p class="font-bold">( ............................ )</p>
            </td>
        </tr>
    </table>
</body>
</html>
