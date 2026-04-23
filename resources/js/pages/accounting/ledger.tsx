import { Head, router } from '@inertiajs/react';
import { web_accounting_ledger } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
    History,
    Search,
    ArrowDownUp,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Coa {
    id: number;
    code: string;
    name: string;
    type: string;
}

interface LedgerLine {
    id: number;
    entry: { date: string; description: string };
    debit: string;
    credit: string;
    running_balance: number;
}

interface LedgerProps {
    coas: Coa[];
    selected_coa_id: number;
    lines: LedgerLine[];
}

export default function LedgerIndex({ coas, selected_coa_id, lines }: LedgerProps) {
    const selectedCoa = coas.find(c => c.id === selected_coa_id);

    const handleCoaChange = (val: string) => {
        router.get(web_accounting_ledger(), { coa_id: val }, { preserveState: true });
    };

    const columns: ColumnDef<LedgerLine>[] = [
        {
            accessorKey: "entry.date",
            header: "Tanggal",
            cell: ({ row }) => format(new Date(row.original.entry.date), 'dd MMM yyyy', { locale: localeId })
        },
        {
            accessorKey: "entry.description",
            header: "Keterangan",
            cell: ({ row }) => <span className="text-xs">{row.original.entry.description}</span>
        },
        {
            accessorKey: "debit",
            header: () => <div className="text-right">Debit</div>,
            cell: ({ row }) => {
                const val = parseFloat(row.original.debit);
                return val > 0 ? <div className="text-right font-mono text-xs">{formatCurrency(val)}</div> : <div className="text-right text-muted-foreground">-</div>;
            }
        },
        {
            accessorKey: "credit",
            header: () => <div className="text-right">Kredit</div>,
            cell: ({ row }) => {
                const val = parseFloat(row.original.credit);
                return val > 0 ? <div className="text-right font-mono text-xs">{formatCurrency(val)}</div> : <div className="text-right text-muted-foreground">-</div>;
            }
        },
        {
            accessorKey: "running_balance",
            header: () => <div className="text-right">Saldo Berjalan</div>,
            cell: ({ row }) => (
                <div className="text-right font-mono font-bold text-sm text-primary">
                    {formatCurrency(row.original.running_balance)}
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Buku Besar" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Buku Besar (Ledger)</h2>
                        </div>
                        <p className="text-muted-foreground italic text-sm">
                            Detail mutasi dan saldo berjalan per akun akuntansi.
                        </p>
                    </div>
                </div>

                {/* Account Selection Card */}
                <Card className="border-primary/10 shadow-sm bg-muted/20">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row items-end gap-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pilih Akun Analisis</Label>
                                <Select value={selected_coa_id.toString()} onValueChange={handleCoaChange}>
                                    <SelectTrigger className="bg-background border-primary/20">
                                        <SelectValue placeholder="Pilih Akun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coas.map(coa => (
                                            <SelectItem key={coa.id} value={coa.id.toString()}>
                                                [{coa.code}] {coa.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {selectedCoa && (
                                <div className="flex gap-4">
                                    <div className="bg-background px-4 py-2 rounded-lg border border-primary/10">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Tipe Akun</p>
                                        <p className="text-sm font-semibold capitalize">{selectedCoa.type}</p>
                                    </div>
                                    <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                                        <p className="text-[9px] uppercase font-bold text-primary">Saldo Terakhir</p>
                                        <p className="text-sm font-bold text-primary">
                                            {lines.length > 0 ? formatCurrency(lines[lines.length - 1].running_balance) : 'Rp 0'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card className="shadow-none border-0 bg-transparent">
                    <DataTable columns={columns} data={lines} />
                </Card>

            </div>
        </>
    );
}

LedgerIndex.layout = {
    breadcrumbs: [
        { title: 'Akuntansi', href: '#' },
        { title: 'Buku Besar', href: web_accounting_ledger() },
    ],
};
