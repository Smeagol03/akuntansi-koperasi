import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardProps {
    members: { total: number; active: number; inactive: number };
    savings: { total_pokok: number; total_wajib: number; total_sukarela: number; grand_total: number };
    loans: { total_disalurkan: number; total_aktif: number; total_lunas: number; outstanding_principal: number };
    shu: { total_pendapatan_bunga: number };
    last_transactions: any[];
}

export default function Dashboard({ members, savings, loans, shu, last_transactions }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Simpanan */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Simpanan</CardTitle>
                            <Wallet className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(savings.grand_total)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pokok: {formatCurrency(savings.total_pokok)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sisa Piutang */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sisa Piutang Beredar</CardTitle>
                            <CreditCard className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(loans.outstanding_principal)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {loans.total_aktif} Pinjaman Aktif
                            </p>
                        </CardContent>
                    </Card>

                    {/* SHU / Bunga */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan Bunga (Laba)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-secondary">{formatCurrency(shu.total_pendapatan_bunga)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dasar perhitungan SHU
                            </p>
                        </CardContent>
                    </Card>

                    {/* Anggota */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{members.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {members.active} Aktif, {members.inactive} Non-aktif
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 md:grid-cols-7">
                    
                    {/* Transaksi Terakhir */}
                    <Card className="md:col-span-4 lg:col-span-5">
                        <CardHeader>
                            <CardTitle>Transaksi Simpanan Terakhir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Anggota</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {last_transactions && last_transactions.length > 0 ? (
                                            last_transactions.map((trx) => (
                                                <TableRow key={trx.id}>
                                                    <TableCell className="font-medium">{trx.member?.name}</TableCell>
                                                    <TableCell>{format(new Date(trx.transaction_date), 'dd MMM yyyy', { locale: id })}</TableCell>
                                                    <TableCell className="capitalize">{trx.type}</TableCell>
                                                    <TableCell className="text-right text-primary font-medium">
                                                        +{formatCurrency(trx.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                    Belum ada transaksi
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Ringkasan Pinjaman */}
                    <Card className="md:col-span-3 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Ringkasan Pinjaman</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Total Disalurkan</p>
                                    <p className="text-sm text-muted-foreground">Sepanjang waktu</p>
                                </div>
                                <div className="font-medium text-right">
                                    {formatCurrency(loans.total_disalurkan)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Pinjaman Lunas</p>
                                    <p className="text-sm text-muted-foreground">Telah selesai</p>
                                </div>
                                <div className="font-medium text-right text-emerald-500">
                                    {loans.total_lunas} Anggota
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
