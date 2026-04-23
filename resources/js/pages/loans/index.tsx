import { Head, useForm, router, Link } from '@inertiajs/react';
import { dashboard, web_loans_index, web_loans_store, web_loans_update_status, web_loans_repay } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, CheckCircle, XCircle, CreditCard, Search, Receipt, Info } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Loan {
    id: number;
    member_id: number;
    amount: string;
    interest_rate: string;
    interest_method: string;
    penalty_rate: string;
    term_months: number;
    monthly_installment: string;
    status: string;
    apply_date: string;
    approved_date: string | null;
    member: {
        id: number;
        name: string;
        member_number: string;
    };
    repayments: { id: number; amount: string; payment_date: string }[];
}

interface LoansProps {
    loans: {
        data: Loan[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function LoansIndex({ loans: loansData, filters }: LoansProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [repayingLoan, setRepayingLoan] = useState<Loan | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, setData, post, processing, errors, reset } = useForm({
        member_number: '',
        amount: '',
        interest_rate: '1.5',
        interest_method: 'flat',
        penalty_rate: '0.1',
        term_months: '12',
        apply_date: new Date().toISOString().split('T')[0],
    });

    const {
        data: repayData,
        setData: setRepayData,
        post: repayPost,
        processing: repayProcessing,
        errors: repayErrors,
        reset: resetRepay,
    } = useForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Isi default amount saat loan dipilih
    useEffect(() => {
        if (repayingLoan) {
            setRepayData('amount', repayingLoan.monthly_installment);
        }
    }, [repayingLoan]);

    // Handle Search & Filter
    useEffect(() => {
        router.get(
            web_loans_index(),
            { search: debouncedSearch, status: filters.status },
            { preserveState: true, replace: true },
        );
    }, [debouncedSearch]);

    const handleStatusFilter = (val: string) => {
        router.get(web_loans_index(), { search: searchTerm, status: val === 'all' ? '' : val }, { preserveState: true });
    };

    const submitLoan = (e: React.FormEvent) => {
        e.preventDefault();
        post(web_loans_store(), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success('Pengajuan pinjaman berhasil dibuat.');
            },
            onError: () => {
                toast.error('Gagal mengajukan pinjaman. Periksa form.');
            },
        });
    };

    const submitRepay = (e: React.FormEvent) => {
        e.preventDefault();
        if (!repayingLoan) return;
        repayPost(web_loans_repay({ loan: repayingLoan.id }), {
            onSuccess: () => {
                setRepayingLoan(null);
                resetRepay();
                toast.success('Pembayaran angsuran berhasil dicatat.');
            },
            onError: () => {
                toast.error('Gagal mencatat pembayaran angsuran.');
            },
        });
    };

    const handleStatusChange = (loanId: number, newStatus: string) => {
        router.patch(
            web_loans_update_status({ loan: loanId }),
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success(`Status pinjaman diperbarui menjadi: ${newStatus === 'active' ? 'Berjalan' : newStatus}`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status pinjaman.');
                },
            },
        );
    };

    // Hitung sisa hutang untuk loan yang sedang dibayar
    const getRemainingAmount = (loan: Loan) => {
        const totalToPay = parseFloat(loan.monthly_installment) * loan.term_months;
        const totalPaid = loan.repayments.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        return totalToPay - totalPaid;
    };

    const columns: ColumnDef<Loan>[] = [
        {
            accessorKey: 'apply_date',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4">
                    Tgl. Pengajuan
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.original.apply_date), 'dd MMM yyyy', { locale: id }),
        },
        {
            accessorKey: 'member.name',
            header: 'Anggota',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.member.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{row.original.member.member_number}</div>
                </div>
            ),
        },
        {
            accessorKey: 'amount',
            header: () => <div className="text-right">Pokok Pinjaman</div>,
            cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(parseFloat(row.original.amount))}</div>,
        },
        {
            accessorKey: 'interest_method',
            header: 'Metode / Bunga',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="capitalize text-sm font-medium">{row.original.interest_method}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{parseFloat(row.original.interest_rate)}% per bulan</span>
                </div>
            ),
        },
        {
            accessorKey: 'monthly_installment',
            header: () => <div className="text-right">Angsuran/Bln</div>,
            cell: ({ row }) => (
                <div className="text-right font-semibold text-primary">{formatCurrency(parseFloat(row.original.monthly_installment))}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : status === 'paid_off'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : status === 'rejected'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                    >
                        {status === 'active' ? 'Berjalan' : status === 'paid_off' ? 'Lunas' : status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const loan = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        {loan.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                    onClick={() => handleStatusChange(loan.id, 'active')}
                                >
                                    <CheckCircle className="mr-1 h-3 w-3" /> Terima
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    onClick={() => handleStatusChange(loan.id, 'rejected')}
                                >
                                    <XCircle className="mr-1 h-3 w-3" /> Tolak
                                </Button>
                            </>
                        )}
                        {loan.status === 'active' && (
                            <Button size="sm" className="h-8" onClick={() => setRepayingLoan(loan)}>
                                <CreditCard className="mr-1 h-3 w-3" /> Bayar
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    // Simulasi kalkulasi form pengajuan
    const amountNum = parseFloat(data.amount) || 0;
    const termNum = parseInt(data.term_months) || 1;
    const interestNum = parseFloat(data.interest_rate) || 0;

    const calculateSimulatedInstallment = () => {
        if (amountNum <= 0) return 0;

        if (data.interest_method === 'flat') {
            return (amountNum / termNum) + (amountNum * (interestNum / 100));
        } else {
            // Annuity (Effective)
            const i = interestNum / 100;
            if (i === 0) return amountNum / termNum;
            return amountNum * (i * Math.pow(1 + i, termNum)) / (Math.pow(1 + i, termNum) - 1);
        }
    };

    const simInstallment = calculateSimulatedInstallment();

    return (
        <>
            <Head title="Manajemen Pinjaman" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pengajuan &amp; Pinjaman</h2>
                        <p className="text-muted-foreground">Kelola pengajuan pinjaman, persetujuan, dan metode bunga lanjutan.</p>
                    </div>

                    {/* Modal Ajukan Pinjaman */}
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Ajukan Pinjaman
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Form Pengajuan Pinjaman</DialogTitle>
                                <DialogDescription>Pilih metode bunga dan tenor yang sesuai dengan profil risiko anggota.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitLoan} className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="member_number">Nomor Anggota *</Label>
                                        <Input
                                            id="member_number"
                                            value={data.member_number}
                                            onChange={(e) => setData('member_number', e.target.value)}
                                            placeholder="KMP-2026-XXXX"
                                            required
                                        />
                                        {errors.member_number && <p className="text-xs text-destructive">{errors.member_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Jumlah Pinjaman (Rp) *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="1000000"
                                            required
                                        />
                                        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="interest_method">Metode Bunga *</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[250px]">
                                                        <p className="text-xs"><strong>Flat</strong>: Bunga dihitung dari pokok awal. <strong>Efektif</strong>: Bunga dihitung dari sisa pokok pinjaman (Metode Anuitas).</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Select value={data.interest_method} onValueChange={(v) => setData('interest_method', v)}>
                                            <SelectTrigger id="interest_method">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flat">Bunga Flat (Tetap)</SelectItem>
                                                <SelectItem value="effective">Bunga Menurun (Efektif)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interest_rate">Suku Bunga (%) *</Label>
                                        <Input
                                            id="interest_rate"
                                            type="number"
                                            step="0.01"
                                            value={data.interest_rate}
                                            onChange={(e) => setData('interest_rate', e.target.value)}
                                            required
                                        />
                                        {errors.interest_rate && <p className="text-xs text-destructive">{errors.interest_rate}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="term_months">Tenor (Bulan) *</Label>
                                        <Input
                                            id="term_months"
                                            type="number"
                                            value={data.term_months}
                                            onChange={(e) => setData('term_months', e.target.value)}
                                            required
                                        />
                                        {errors.term_months && <p className="text-xs text-destructive">{errors.term_months}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="penalty_rate">Denda Harian (%) *</Label>
                                        <Input
                                            id="penalty_rate"
                                            type="number"
                                            step="0.01"
                                            value={data.penalty_rate}
                                            onChange={(e) => setData('penalty_rate', e.target.value)}
                                            required
                                        />
                                        {errors.penalty_rate && <p className="text-xs text-destructive">{errors.penalty_rate}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apply_date">Tanggal Pengajuan *</Label>
                                    <Input
                                        id="apply_date"
                                        type="date"
                                        value={data.apply_date}
                                        onChange={(e) => setData('apply_date', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Simulasi Box */}
                                <div className="mt-2 rounded-lg bg-primary/5 p-4 border border-primary/20">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                                        <Receipt className="h-4 w-4" /> Hasil Simulasi ({data.interest_method.toUpperCase()})
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Cicilan per bulan:</span>
                                            <span className="font-bold text-lg">{formatCurrency(simInstallment)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-2 border-t border-primary/10">
                                            <span className="text-muted-foreground">Total yang akan dibayar:</span>
                                            <span className="font-medium">{formatCurrency(simInstallment * termNum)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <span>Total beban bunga:</span>
                                            <span>{formatCurrency((simInstallment * termNum) - (parseFloat(data.amount) || 0))}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Memproses...' : 'Ajukan Pinjaman'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-lg border">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau nomor anggota peminjam..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="active">Berjalan</SelectItem>
                                <SelectItem value="paid_off">Lunas</SelectItem>
                                <SelectItem value="rejected">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable columns={columns} data={loansData.data} links={loansData.links} />
            </div>

            {/* Modal Bayar Angsuran */}
            <Dialog open={!!repayingLoan} onOpenChange={(open) => !open && setRepayingLoan(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Bayar Angsuran Pinjaman</DialogTitle>
                        <DialogDescription>
                            Catat pembayaran angsuran untuk <strong>{repayingLoan?.member?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    {repayingLoan && (
                        <div className="rounded-lg bg-muted/50 p-4 border border-border text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pokok Pinjaman:</span>
                                <span className="font-medium">{formatCurrency(parseFloat(repayingLoan.amount))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Angsuran/Bulan:</span>
                                <span className="font-medium">{formatCurrency(parseFloat(repayingLoan.monthly_installment))}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 mt-1">
                                <span className="text-muted-foreground font-medium">Sisa Hutang:</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(getRemainingAmount(repayingLoan))}
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submitRepay} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="repay-amount">Jumlah Bayar (Rp) *</Label>
                            <Input
                                id="repay-amount"
                                type="number"
                                value={repayData.amount}
                                onChange={(e) => setRepayData('amount', e.target.value)}
                                required
                            />
                            {repayErrors.amount && <p className="text-xs text-destructive">{repayErrors.amount}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="repay-date">Tanggal Bayar *</Label>
                            <Input
                                id="repay-date"
                                type="date"
                                value={repayData.payment_date}
                                onChange={(e) => setRepayData('payment_date', e.target.value)}
                                required
                            />
                            {repayErrors.payment_date && <p className="text-xs text-destructive">{repayErrors.payment_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="repay-description">Keterangan</Label>
                            <Input
                                id="repay-description"
                                value={repayData.description}
                                onChange={(e) => setRepayData('description', e.target.value)}
                                placeholder="Opsional"
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setRepayingLoan(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={repayProcessing}>
                                {repayProcessing ? 'Memproses...' : 'Catat Pembayaran'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

LoansIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Pinjaman',
            href: web_loans_index(),
        },
    ],
};
