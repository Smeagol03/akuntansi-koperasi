import { Head, router, Link } from '@inertiajs/react';
import { dashboard, web_loans_schedules, web_members_show } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpDown, History } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface LoanSchedule {
    id: number;
    loan_id: number;
    installment_number: number;
    due_date: string;
    total_due: string;
    status: string;
    loan: {
        member: {
            id: number;
            name: string;
            member_number: string;
        }
    };
}

interface SchedulesProps {
    schedules: {
        data: LoanSchedule[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
        month?: string;
    };
}

export default function SchedulesIndex({ schedules, filters }: SchedulesProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Handle Search & Filter
    useEffect(() => {
        router.get(web_loans_schedules(), { 
            search: debouncedSearch,
            status: filters.status,
            month: filters.month
        }, { preserveState: true, replace: true });
    }, [debouncedSearch]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(web_loans_schedules(), { 
            ...filters,
            search: searchTerm,
            [key]: value === 'all' ? '' : value
        }, { preserveState: true });
    };

    const columns: ColumnDef<LoanSchedule>[] = [
        {
            accessorKey: "due_date",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                  Jatuh Tempo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.due_date);
                const isOverdue = row.original.status !== 'paid' && date < new Date();
                return (
                    <div className="flex flex-col">
                        <span className={cn("font-medium", isOverdue ? "text-red-600 font-bold" : "")}>
                            {format(date, 'dd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                            Angsuran #{row.original.installment_number}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "loan.member.name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
                  Anggota
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    <Link 
                        href={web_members_show({ member: row.original.loan.member.id })}
                        className="font-semibold text-primary hover:underline"
                    >
                        {row.original.loan.member.name}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-mono">{row.original.loan.member.member_number}</div>
                </div>
            )
        },
        {
            accessorKey: "total_due",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mr-4">
                        Tagihan
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right font-mono font-bold text-sm">{formatCurrency(parseFloat(row.original.total_due))}</div>
        },
        {
            accessorKey: "status",
            header: () => <div className="text-center text-xs font-bold uppercase tracking-widest opacity-50">Status</div>,
            cell: ({ row }) => {
                const status = row.original.status;
                const isOverdue = status !== 'paid' && new Date(row.original.due_date) < new Date();
                
                if (status === 'paid') return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-tighter">
                            <CheckCircle2 className="h-3 w-3" /> Lunas
                        </span>
                    </div>
                );

                if (isOverdue) return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-tighter animate-pulse">
                            <AlertCircle className="h-3 w-3" /> Terlewat
                        </span>
                    </div>
                );

                return (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-tighter">
                            <Clock className="h-3 w-3" /> Menunggu
                        </span>
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-bold uppercase tracking-widest opacity-50">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight hover:bg-primary hover:text-primary-foreground transition-all" asChild>
                        <Link href={web_members_show({ member: row.original.loan.member.id })}>
                            Bayar <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Monitoring Jadwal Angsuran" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <h2 className="text-3xl font-bold tracking-tight">Monitoring Tagihan</h2>
                    </div>
                    <p className="text-muted-foreground italic text-sm">
                        Pantau seluruh jadwal angsuran, kelola penagihan tepat waktu, dan identifikasi kredit macet secara dini.
                    </p>
                </div>

                {/* Filters Row - Enhanced Design */}
                <div className="grid gap-4 md:grid-cols-4 items-end bg-muted/20 p-6 rounded-2xl border border-primary/10 shadow-inner">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cari Nama / No. Anggota</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ketik nama atau nomor anggota..."
                                className="pl-10 bg-background border-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter Status Tagihan</Label>
                        <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                            <SelectTrigger className="bg-background border-primary/20">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                                <SelectItem value="overdue">🔴 Terlewat (Overdue)</SelectItem>
                                <SelectItem value="paid">🟢 Sudah Lunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bulan Jatuh Tempo</Label>
                        <Input 
                            type="month" 
                            className="bg-background border-primary/20 cursor-pointer"
                            value={filters.month || ''} 
                            onChange={(e) => handleFilterChange('month', e.target.value)} 
                        />
                    </div>
                </div>

                <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
                    <DataTable columns={columns} data={schedules.data} links={schedules.links} />
                </div>

            </div>
        </>
    );
}

SchedulesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pinjaman', href: '#' },
        { title: 'Monitoring Tagihan', href: web_loans_schedules() },
    ],
};
