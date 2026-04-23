import { Head } from '@inertiajs/react';
import { 
    FilePieChart, 
    ArrowUpRight, 
    ArrowDownRight, 
    Coins, 
    Briefcase,
    Building,
    TrendingUp,
    Scale
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CoaReport {
    code: string;
    name: string;
    balance: number;
}

interface ReportsProps {
    balance_sheet: {
        assets: CoaReport[];
        liabilities: CoaReport[];
        equity: CoaReport[];
        total_assets: number;
        total_liabilities_equity: number;
    };
    income_statement: {
        income: CoaReport[];
        expenses: CoaReport[];
        net_profit_loss: number;
    };
}

export default function AccountingReports({ balance_sheet, income_statement }: ReportsProps) {
    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
                
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <FilePieChart className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan Formal</h2>
                    </div>
                    <p className="text-muted-foreground italic text-sm italic">
                        Laporan otomatis berdasarkan standar akuntansi Double-Entry.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    
                    {/* NERACA (Balance Sheet) */}
                    <Card className="shadow-md border-t-4 border-t-primary">
                        <CardHeader className="bg-muted/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Scale className="h-5 w-5" /> Neraca (Balance Sheet)
                                    </CardTitle>
                                    <CardDescription>Posisi Aset vs Kewajiban & Ekuitas</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Harta (Aset)</h4>
                                <Table>
                                    <TableBody>
                                        {balance_sheet.assets.map(item => (
                                            <TableRow key={item.code} className="border-0 hover:bg-transparent">
                                                <TableCell className="py-2 text-xs">[{item.code}] {item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-mono font-medium">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t-2 font-bold">
                                            <TableCell className="py-3">TOTAL ASET</TableCell>
                                            <TableCell className="py-3 text-right text-primary font-mono">{formatCurrency(balance_sheet.total_assets)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="p-4 border-t">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Kewajiban & Modal</h4>
                                <Table>
                                    <TableBody>
                                        {/* Liabilities */}
                                        {balance_sheet.liabilities.map(item => (
                                            <TableRow key={item.code} className="border-0 hover:bg-transparent">
                                                <TableCell className="py-2 text-xs">[{item.code}] {item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-mono">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Equity */}
                                        {balance_sheet.equity.map(item => (
                                            <TableRow key={item.code} className="border-0 hover:bg-transparent">
                                                <TableCell className="py-2 text-xs">[{item.code}] {item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-mono">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Net Income as part of Equity */}
                                        <TableRow className="border-0 hover:bg-transparent italic text-muted-foreground">
                                            <TableCell className="py-2 text-xs pl-6">Laba/Rugi Berjalan (SHU)</TableCell>
                                            <TableCell className="py-2 text-right font-mono">{formatCurrency(income_statement.net_profit_loss)}</TableCell>
                                        </TableRow>
                                        <TableRow className="border-t-2 font-bold">
                                            <TableCell className="py-3">TOTAL KEWAJIBAN & MODAL</TableCell>
                                            <TableCell className="py-3 text-right text-primary font-mono">{formatCurrency(balance_sheet.total_liabilities_equity)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* LABA RUGI (Income Statement) */}
                    <Card className="shadow-md border-t-4 border-t-secondary">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" /> Laporan SHU (Laba Rugi)
                            </CardTitle>
                            <CardDescription>Pendapatan dikurangi Beban Operasional</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Pendapatan</h4>
                                <Table>
                                    <TableBody>
                                        {income_statement.income.map(item => (
                                            <TableRow key={item.code} className="border-0 hover:bg-transparent">
                                                <TableCell className="py-2 text-xs">[{item.code}] {item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-mono">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="p-4 border-t">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">Beban-beban</h4>
                                <Table>
                                    <TableBody>
                                        {income_statement.expenses.map(item => (
                                            <TableRow key={item.code} className="border-0 hover:bg-transparent">
                                                <TableCell className="py-2 text-xs">[{item.code}] {item.name}</TableCell>
                                                <TableCell className="py-2 text-right font-mono">{formatCurrency(item.balance)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t-2 font-bold bg-muted/20">
                                            <TableCell className="py-3">SISA HASIL USAHA (SHU)</TableCell>
                                            <TableCell className={cn(
                                                "py-3 text-right text-lg font-mono",
                                                income_statement.net_profit_loss >= 0 ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {formatCurrency(income_statement.net_profit_loss)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            
                            <div className="p-6">
                                <div className="rounded-xl border border-dashed p-4 flex flex-col items-center justify-center text-center space-y-2">
                                    <Coins className="h-8 w-8 text-muted-foreground opacity-30" />
                                    <p className="text-xs text-muted-foreground">
                                        SHU ini adalah nilai berjalan yang akan dialokasikan ke anggota pada akhir periode akuntansi sesuai jasa masing-masing.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </>
    );
}

AccountingReports.layout = {
    breadcrumbs: [
        { title: 'Akuntansi', href: '#' },
        { title: 'Laporan Keuangan', href: '/accounting/reports' },
    ],
};
