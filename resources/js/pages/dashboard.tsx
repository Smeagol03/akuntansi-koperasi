import { Head, Link } from '@inertiajs/react';
import { dashboard, web_members_show } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Users, 
    Wallet, 
    CreditCard, 
    TrendingUp, 
    Bell, 
    AlertCircle, 
    ArrowUpRight, 
    Activity,
    Calendar,
    ChevronRight,
    Gauge,
    Droplets,
    ShieldAlert
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

interface DashboardProps {
    members: { total: number; active: number; inactive: number };
    savings: { total_pokok: number; total_wajib: number; total_sukarela: number; grand_total: number };
    loans: { total_disalurkan: number; total_aktif: number; total_lunas: number; outstanding_principal: number };
    shu: { total_pendapatan_bunga: number };
    ratios: { cash_on_hand: number; npl: number; liquidity: number };
    monthly_trends: { month: string; savings: number; loans: number }[];
    last_transactions: any[];
    upcoming_installments: any[];
    overdue_installments: any[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard({ 
    members, 
    savings, 
    loans, 
    shu, 
    ratios,
    monthly_trends,
    last_transactions,
    upcoming_installments,
    overdue_installments 
}: DashboardProps) {
    const hasAlerts = (upcoming_installments && upcoming_installments.length > 0) || 
                      (overdue_installments && overdue_installments.length > 0);

    const savingsDistribution = [
        { name: 'Pokok', value: savings.total_pokok || 0 },
        { name: 'Wajib', value: savings.total_wajib || 0 },
        { name: 'Sukarela', value: savings.total_sukarela || 0 },
    ].filter(item => item.value > 0);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground">{entry.name}:</span>
                            <span className="font-mono font-medium">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Ringkasan Operasional</h1>
                    <p className="text-muted-foreground italic text-sm">
                        Terakhir diperbarui pada {format(new Date(), 'eeee, dd MMMM yyyy HH:mm', { locale: id })}
                    </p>
                </div>

                {/* KPI Ratios Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">Cash on Hand</CardTitle>
                            <Droplets className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(ratios.cash_on_hand)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Uang cair tersedia di Kas & Bank</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">Likuiditas</CardTitle>
                            <Gauge className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{ratios.liquidity}%</div>
                            <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1.5 rounded-full mt-2">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(ratios.liquidity, 100)}%` }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "bg-red-50/50 border-red-100 dark:bg-red-950/10 dark:border-red-900/30",
                        ratios.npl < 5 ? "bg-emerald-50/50 border-emerald-100" : ""
                    )}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className={cn("text-xs font-bold uppercase tracking-wider", ratios.npl > 5 ? "text-red-600" : "text-emerald-600")}>NPL (Kredit Macet)</CardTitle>
                            <ShieldAlert className={cn("h-4 w-4", ratios.npl > 5 ? "text-red-500" : "text-emerald-500")} />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-xl font-bold", ratios.npl > 5 ? "text-red-600" : "text-emerald-600")}>{ratios.npl}%</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Standar aman di bawah 5%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-t-2 border-t-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dana Simpanan</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(savings.grand_total ?? 0)}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                <Activity className="h-3 w-3 text-emerald-500" />
                                <span>Total akumulasi saldo</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-t-2 border-t-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Pinjaman</CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(loans.outstanding_principal ?? 0)}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                <Activity className="h-3 w-3 text-orange-500" />
                                <span>Dari {loans.total_aktif ?? 0} pinjaman aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-t-2 border-t-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pendapatan Bunga</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(shu.total_pendapatan_bunga ?? 0)}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                <span>Dasar pembagian SHU</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-t-2 border-t-slate-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partisipasi Anggota</CardTitle>
                            <Users className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{members.total ?? 0}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{members.active ?? 0} Anggota Aktif</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid gap-4 md:grid-cols-12">
                    <Card className="md:col-span-8 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-primary">Tren Pertumbuhan (6 Bulan)</CardTitle>
                            <CardDescription>Perbandingan Simpanan vs Pinjaman (Rp)</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `Rp${value/1000000}jt`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                        <Area name="Simpanan" type="monotone" dataKey="savings" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                                        <Area name="Pinjaman" type="monotone" dataKey="loans" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorLoans)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Komposisi Dana</CardTitle>
                            <CardDescription>Pembagian jenis simpanan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[220px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={savingsDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {savingsDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4 text-xs">
                                {savingsDistribution.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-muted-foreground">{item.name}</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-12">
                    {/* Recent Transactions Table */}
                    <Card className="md:col-span-8 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Aktifitas Terakhir</CardTitle>
                                <CardDescription>5 mutasi simpanan terbaru</CardDescription>
                            </div>
                            <Link href="/savings" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium font-mono uppercase tracking-tighter">
                                Semua Data <ChevronRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                        <TableRow>
                                            <TableHead className="font-semibold">Anggota</TableHead>
                                            <TableHead className="font-semibold text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {last_transactions && last_transactions.length > 0 ? (
                                            last_transactions.map((trx) => {
                                                const amount = parseFloat(trx.amount);
                                                const type = trx.account?.type || 'sukarela';
                                                return (
                                                    <TableRow key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-sm">{trx.account?.member?.name}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                                    {type} • {format(parseISO(trx.transaction_date), 'dd MMM yyyy', { locale: id })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`font-mono font-bold text-sm ${amount < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                                                {amount < 0 ? '' : '+'}{formatCurrency(amount)}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center h-24 text-muted-foreground italic">
                                                    Belum ada aktifitas transaksi
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 shadow-sm border-amber-100 dark:border-amber-900/30">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-600 uppercase tracking-tighter">
                                <Bell className="h-4 w-4" />
                                Monitor Tagihan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-red-600 uppercase text-[10px]">Terlewat (Overdue)</span>
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{overdue_installments?.length || 0}</span>
                                </div>
                                {overdue_installments?.slice(0, 2).map((item: any) => (
                                    <div key={item.id} className="p-2 rounded border border-red-100 bg-red-50/20 text-xs">
                                        <div className="flex justify-between font-bold">
                                            <span>{item.loan?.member?.name}</span>
                                            <span className="text-red-600">{formatCurrency(parseFloat(item.total_due))}</span>
                                        </div>
                                        <Link href={web_members_show({ member: item.loan.member_id })} className="text-[9px] text-blue-600 underline uppercase font-bold mt-1 inline-block">Proses Penagihan</Link>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold text-amber-600 uppercase text-[10px]">7 Hari Mendatang</span>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{upcoming_installments?.length || 0}</span>
                                </div>
                                {upcoming_installments?.slice(0, 2).map((item: any) => (
                                    <div key={item.id} className="p-2 rounded border border-amber-100 bg-amber-50/20 text-xs">
                                        <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
                                            <span>{item.loan?.member?.name}</span>
                                            <span>{formatCurrency(parseFloat(item.total_due))}</span>
                                        </div>
                                        <span className="text-[9px] text-muted-foreground">{format(parseISO(item.due_date), 'eeee, dd MMM', { locale: id })}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
