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
    ShieldAlert,
    BarChart3
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
    Legend
} from 'recharts';

interface DashboardProps {
    members: { total: number; active: number; inactive: number };
    savings: { total_pokok: number; total_wajib: number; total_sukarela: number; grand_total: number };
    loans: { total_disalurkan: number; total_aktif: number; total_lunas: number; outstanding_principal: number };
    shu: { total_pendapatan_bunga: number };
    ratios: { cash_on_hand: number; npl: number; liquidity: number };
    loan_risk: { name: string; value: number }[];
    monthly_trends: { month: string; savings: number; loans: number }[];
    last_transactions: any[];
    upcoming_installments: any[];
    overdue_installments: any[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];
const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard({ 
    members, 
    savings, 
    loans, 
    shu, 
    ratios,
    loan_risk,
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
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Koperasi Merah Putih</h1>
                    <p className="text-muted-foreground italic text-sm">
                        Laporan konsolidasi per {format(new Date(), 'dd MMMM yyyy', { locale: id })}
                    </p>
                </div>

                {/* KPI Ratios Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">Cash Liquidity</CardTitle>
                            <Droplets className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(ratios.cash_on_hand)}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground">Rasio:</span>
                                <span className="text-[10px] font-bold text-emerald-600">{ratios.liquidity}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">Health Score</CardTitle>
                            <Gauge className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">Prima</div>
                            <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1.5 rounded-full mt-2">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "bg-red-50/50 border-red-100 dark:bg-red-950/10 dark:border-red-900/30",
                        ratios.npl < 5 ? "bg-emerald-50/50 border-emerald-100" : ""
                    )}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className={cn("text-xs font-bold uppercase tracking-wider", ratios.npl > 5 ? "text-red-600" : "text-emerald-600")}>NPL Ratio</CardTitle>
                            <ShieldAlert className={cn("h-4 w-4", ratios.npl > 5 ? "text-red-500" : "text-emerald-500")} />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-xl font-bold", ratios.npl > 5 ? "text-red-600" : "text-emerald-600")}>{ratios.npl}%</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Non-Performing Loan Rate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-t-2 border-t-blue-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Dana Anggota</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(savings.grand_total ?? 0)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Total Simpanan Konsolidasi</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-2 border-t-orange-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Piutang Beredar</CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(loans.outstanding_principal ?? 0)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Sisa Pokok & Bunga Berjalan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-2 border-t-emerald-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Laba SHU</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(shu.total_pendapatan_bunga ?? 0)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Akumulasi Pendapatan Bunga</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-2 border-t-slate-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Anggota</CardTitle>
                            <Users className="h-4 w-4 text-slate-600 opacity-50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{members.total ?? 0}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{members.active ?? 0} Anggota Berstatus Aktif</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area 1: Growth Trend */}
                <div className="grid gap-4 md:grid-cols-12">
                    <Card className="md:col-span-8 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" /> Trend Pertumbuhan
                                </CardTitle>
                                <CardDescription className="text-xs">Data simpanan vs pinjaman 6 bulan terakhir</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthly_trends}>
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
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `Rp${val/1000000}jt`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                        <Area name="Simpanan" type="monotone" dataKey="savings" stroke="#2563eb" fill="url(#colorSavings)" strokeWidth={2} />
                                        <Area name="Pinjaman" type="monotone" dataKey="loans" stroke="#f59e0b" fill="url(#colorLoans)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-red-500" /> Profil Risiko Kredit
                            </CardTitle>
                            <CardDescription className="text-xs">Komposisi kualitas pinjaman (Rp)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={loan_risk} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                                            {loan_risk.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4 text-[10px]">
                                {loan_risk.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between border-b border-muted pb-1 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLORS[index % RISK_COLORS.length] }} />
                                            <span className="text-muted-foreground uppercase">{item.name}</span>
                                        </div>
                                        <span className="font-bold">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area 2: Recent Activity & Alerts */}
                <div className="grid gap-4 md:grid-cols-12">
                    <Card className="md:col-span-8 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">Aktifitas Mutasi Terkini</CardTitle>
                                <CardDescription className="text-[10px]">5 transaksi simpanan terbaru masuk/keluar</CardDescription>
                            </div>
                            <Link href="/savings" className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase hover:underline">
                                Lihat Semua <ChevronRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {last_transactions && last_transactions.length > 0 ? (
                                        last_transactions.map((trx) => {
                                            const amount = parseFloat(trx.amount);
                                            return (
                                                <TableRow key={trx.id} className="hover:bg-muted/50 transition-colors border-b last:border-0">
                                                    <TableCell className="py-3 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-xs uppercase">{trx.account?.member?.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {trx.account?.type} • {format(parseISO(trx.transaction_date), 'dd MMM yyyy')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-3 px-6">
                                                        <span className={cn(
                                                            "font-mono font-bold text-sm",
                                                            amount < 0 ? "text-red-600" : "text-emerald-600"
                                                        )}>
                                                            {amount < 0 ? '' : '+'}{formatCurrency(amount)}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow><TableCell colSpan={2} className="text-center py-10 italic text-muted-foreground">Belum ada aktifitas</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4 shadow-sm flex flex-col">
                        <CardHeader className="bg-amber-50/50 dark:bg-amber-950/10 border-b">
                            <CardTitle className="text-xs font-bold flex items-center gap-2 text-amber-600 uppercase tracking-widest">
                                <Bell className="h-3.5 w-3.5" /> Penagihan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 flex-1">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-red-600 uppercase">Macet (Overdue)</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">{overdue_installments?.length || 0}</span>
                                </div>
                                {overdue_installments?.slice(0, 2).map((item: any) => (
                                    <div key={item.id} className="p-2 rounded-lg border-l-4 border-l-red-600 bg-red-50/20 text-[11px]">
                                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                                            <span className="truncate pr-2">{item.loan?.member?.name}</span>
                                            <span className="text-red-600 shrink-0">{formatCurrency(parseFloat(item.total_due))}</span>
                                        </div>
                                        <Link href={web_members_show({ member: item.loan.member_id })} className="text-[9px] text-blue-600 font-bold mt-1 uppercase hover:underline">Proses Sekarang</Link>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-amber-600 uppercase">7 Hari Depan</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">{upcoming_installments?.length || 0}</span>
                                </div>
                                {upcoming_installments?.slice(0, 2).map((item: any) => (
                                    <div key={item.id} className="p-2 rounded-lg border-l-4 border-l-amber-400 bg-amber-50/20 text-[11px]">
                                        <div className="flex justify-between text-slate-800 dark:text-slate-200">
                                            <span className="truncate pr-2 font-medium">{item.loan?.member?.name}</span>
                                            <span className="font-bold">{formatCurrency(parseFloat(item.total_due))}</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground mt-1 italic">{format(parseISO(item.due_date), 'eeee, dd MMM')}</p>
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
