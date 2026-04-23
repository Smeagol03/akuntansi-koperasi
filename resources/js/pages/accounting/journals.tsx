import { Head, router } from '@inertiajs/react';
import { web_accounting_journals } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
    Search, 
    Calendar, 
    BookText,
    ArrowRightLeft,
    FileSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JournalLine {
    coa: { code: string; name: string };
    debit: string;
    credit: string;
}

interface JournalEntry {
    id: number;
    date: string;
    description: string;
    lines: JournalLine[];
}

interface JournalsProps {
    journals: {
        data: JournalEntry[];
        links: any[];
    };
    filters: {
        search?: string;
        date?: string;
    };
}

export default function JournalsIndex({ journals, filters }: JournalsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        router.get(web_accounting_journals(), { 
            search: debouncedSearch,
            date: filters.date
        }, { preserveState: true, replace: true });
    }, [debouncedSearch]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(web_accounting_journals(), { 
            ...filters,
            search: searchTerm,
            [key]: value
        }, { preserveState: true });
    };

    const columns: ColumnDef<JournalEntry>[] = [
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">
                        {format(new Date(row.original.date), 'dd MMM yyyy', { locale: localeId })}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">ID: JRN-{row.original.id}</span>
                </div>
            )
        },
        {
            accessorKey: "description",
            header: "Deskripsi Transaksi",
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    <p className="text-xs font-semibold leading-tight">{row.original.description}</p>
                </div>
            )
        },
        {
            id: "details",
            header: "Detail Jurnal (COA - Debit / Kredit)",
            cell: ({ row }) => (
                <div className="space-y-1 min-w-[350px]">
                    {row.original.lines.map((line, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 text-[11px] py-1 border-b border-muted/30 last:border-0">
                            <div className={cn(
                                "col-span-6 flex gap-2 items-center",
                                parseFloat(line.credit) > 0 ? "pl-4 italic text-muted-foreground" : "font-semibold"
                            )}>
                                <span className="font-mono opacity-60">[{line.coa.code}]</span>
                                <span className="truncate">{line.coa.name}</span>
                            </div>
                            <div className="col-span-3 text-right">
                                {parseFloat(line.debit) > 0 ? formatCurrency(parseFloat(line.debit)) : '-'}
                            </div>
                            <div className="col-span-3 text-right">
                                {parseFloat(line.credit) > 0 ? formatCurrency(parseFloat(line.credit)) : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Jurnal Umum" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <BookText className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Jurnal Umum</h2>
                        </div>
                        <p className="text-muted-foreground italic text-sm">
                            Catatan kronologis seluruh aktivitas finansial koperasi menggunakan sistem Double-Entry.
                        </p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid gap-4 md:grid-cols-3 items-end bg-muted/30 p-4 rounded-xl border border-primary/10 shadow-inner">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Cari Deskripsi</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari keterangan transaksi..."
                                className="pl-8 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Filter Tanggal</Label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="date" 
                                className="pl-8 bg-background"
                                value={filters.date || ''} 
                                onChange={(e) => handleFilterChange('date', e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                {/* Legend / Info */}
                <div className="flex items-center gap-4 px-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-foreground rounded-full" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Debit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 border border-muted-foreground rounded-full" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground italic">Kredit (Indented)</span>
                    </div>
                </div>

                <DataTable columns={columns} data={journals.data} links={journals.links} />

            </div>
        </>
    );
}

JournalsIndex.layout = {
    breadcrumbs: [
        { title: 'Akuntansi', href: '#' },
        { title: 'Jurnal Umum', href: web_accounting_journals() },
    ],
};
