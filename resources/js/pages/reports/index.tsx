import { Head } from '@inertiajs/react';
import { dashboard, web_reports_index } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Users, BarChart2 } from 'lucide-react';

interface MonthlySaving {
    month: string;
    total_setor: number;
    total_tarik: number;
    jumlah_transaksi: number;
}

interface MonthlyLoan {
    month: string;
    jumlah_pengajuan: number;
    total_pokok: number;
    jumlah_aktif: number;
    jumlah_lunas: number;
}

interface ReportProps {
    monthly_savings: MonthlySaving[];
    monthly_loans: MonthlyLoan[];
    summary: {
        members: { total: number; active: number; inactive: number };
        savings: { total_pokok: number; total_wajib: number; total_sukarela: number; grand_total: number };
        loans: { total_disalurkan: number; total_aktif: number; total_lunas: number; outstanding_principal: number };
        shu: { total_pendapatan_bunga: number };
    };
}

function formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export default function ReportsIndex({ monthly_savings, monthly_loans, summary }: ReportProps) {
    const totalSetorAllTime = monthly_savings.reduce((sum, m) => sum + m.total_setor, 0);
    const totalTarikAllTime = monthly_savings.reduce((sum, m) => sum + m.total_tarik, 0);

    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h2>
                    <p className="text-muted-foreground">Rekap bulanan aktivitas simpanan dan pinjaman koperasi (12 bulan terakhir).</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.members.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {summary.members.active} Aktif · {summary.members.inactive} Non-aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Simpanan</CardTitle>
                            <Wallet className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.savings.grand_total)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pokok: {formatCurrency(summary.savings.total_pokok)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sisa Piutang Beredar</CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.loans.outstanding_principal)}</div>
                            <p className="text-xs text-muted-foreground mt-1">{summary.loans.total_aktif} Pinjaman Aktif</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan Bunga</CardTitle>
                            <BarChart2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(summary.shu.total_pendapatan_bunga)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Dasar perhitungan SHU</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rekap Simpanan Bulanan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Rekap Simpanan Bulanan
                        </CardTitle>
                        <CardDescription>12 bulan terakhir — setoran masuk vs penarikan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthly_savings.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">Belum ada data simpanan</p>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bulan</TableHead>
                                                <TableHead className="text-right">Jml. Transaksi</TableHead>
                                                <TableHead className="text-right">Total Setoran</TableHead>
                                                <TableHead className="text-right">Total Penarikan</TableHead>
                                                <TableHead className="text-right">Selisih Bersih</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {monthly_savings.map((row) => {
                                                const net = row.total_setor - row.total_tarik;
                                                return (
                                                    <TableRow key={row.month}>
                                                        <TableCell className="font-medium">{formatMonth(row.month)}</TableCell>
                                                        <TableCell className="text-right">{row.jumlah_transaksi}</TableCell>
                                                        <TableCell className="text-right text-primary">
                                                            +{formatCurrency(row.total_setor)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-red-500">
                                                            {row.total_tarik > 0 ? `-${formatCurrency(row.total_tarik)}` : '-'}
                                                        </TableCell>
                                                        <TableCell className={`text-right font-medium ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                                            {formatCurrency(net)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Totals */}
                                <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-muted/30 p-4 border text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-muted-foreground">Total Setoran (12 bln)</p>
                                            <p className="font-bold text-primary">+{formatCurrency(totalSetorAllTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        <div>
                                            <p className="text-muted-foreground">Total Penarikan (12 bln)</p>
                                            <p className="font-bold text-red-500">-{formatCurrency(totalTarikAllTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart2 className="h-4 w-4 text-emerald-500" />
                                        <div>
                                            <p className="text-muted-foreground">Selisih Bersih (12 bln)</p>
                                            <p className={`font-bold ${totalSetorAllTime - totalTarikAllTime >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                                {formatCurrency(totalSetorAllTime - totalTarikAllTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Rekap Pinjaman Bulanan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Rekap Pinjaman Bulanan
                        </CardTitle>
                        <CardDescription>12 bulan terakhir — pengajuan dan status pinjaman</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthly_loans.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">Belum ada data pinjaman</p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bulan</TableHead>
                                            <TableHead className="text-right">Jml. Pengajuan</TableHead>
                                            <TableHead className="text-right">Total Pokok</TableHead>
                                            <TableHead className="text-right">Aktif</TableHead>
                                            <TableHead className="text-right">Lunas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthly_loans.map((row) => (
                                            <TableRow key={row.month}>
                                                <TableCell className="font-medium">{formatMonth(row.month)}</TableCell>
                                                <TableCell className="text-right">{row.jumlah_pengajuan}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(row.total_pokok)}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {row.jumlah_aktif}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        {row.jumlah_lunas}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan',
            href: web_reports_index(),
        },
    ],
};
