import { Head, useForm, router } from '@inertiajs/react';
import { dashboard, web_savings_index, web_savings_store, web_savings_withdraw } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, Search, ArrowDownLeft } from 'lucide-react';
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

interface SavingTransaction {
    id: number;
    member_id: number;
    amount: string;
    type: string;
    description: string | null;
    transaction_date: string;
    member: {
        id: number;
        name: string;
        member_number: string;
    };
}

interface SavingsProps {
    transactions: {
        data: SavingTransaction[];
        links: any[];
    };
    filters: {
        search?: string;
        type?: string;
    };
}

export default function SavingsIndex({ transactions, filters }: SavingsProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Form: Catat Setoran
    const { data, setData, post, processing, errors, reset } = useForm({
        member_number: '',
        amount: '',
        type: 'wajib',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    // Form: Tarik Simpanan
    const {
        data: withdrawData,
        setData: setWithdrawData,
        post: withdrawPost,
        processing: withdrawProcessing,
        errors: withdrawErrors,
        reset: resetWithdraw,
    } = useForm({
        member_number: '',
        amount: '',
        type: 'sukarela',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    // Handle Search & Filter
    useEffect(() => {
        router.get(
            web_savings_index(),
            { search: debouncedSearch, type: filters.type },
            { preserveState: true, replace: true },
        );
    }, [debouncedSearch]);

    const handleTypeFilter = (val: string) => {
        router.get(web_savings_index(), { search: searchTerm, type: val === 'all' ? '' : val }, { preserveState: true });
    };

    const submitDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        post(web_savings_store(), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success('Setoran simpanan berhasil dicatat');
            },
            onError: () => {
                toast.error('Gagal mencatat simpanan. Pastikan nomor anggota terdaftar.');
            },
        });
    };

    const submitWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        withdrawPost(web_savings_withdraw(), {
            onSuccess: () => {
                setIsWithdrawModalOpen(false);
                resetWithdraw();
                toast.success('Penarikan simpanan berhasil dicatat');
            },
            onError: () => {
                toast.error('Gagal mencatat penarikan. Pastikan nomor anggota terdaftar.');
            },
        });
    };

    const columns: ColumnDef<SavingTransaction>[] = [
        {
            accessorKey: 'transaction_date',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4">
                    Tanggal
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.original.transaction_date), 'dd MMM yyyy', { locale: id }),
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
            accessorKey: 'type',
            header: 'Jenis Simpanan',
            cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
        },
        {
            accessorKey: 'description',
            header: 'Keterangan',
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || '-'}</span>,
        },
        {
            accessorKey: 'amount',
            header: () => <div className="text-right">Jumlah</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.original.amount);
                const isWithdrawal = amount < 0;
                return (
                    <div className={`text-right font-medium ${isWithdrawal ? 'text-red-500' : 'text-primary'}`}>
                        {isWithdrawal ? '-' : '+'}{formatCurrency(Math.abs(amount))}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Manajemen Simpanan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Riwayat Simpanan</h2>
                        <p className="text-muted-foreground">Catat dan pantau seluruh transaksi simpanan anggota koperasi.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Modal Tarik Simpanan */}
                        <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Tarik Simpanan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Penarikan Simpanan Sukarela</DialogTitle>
                                    <DialogDescription>
                                        Catat penarikan simpanan sukarela anggota. Simpanan pokok &amp; wajib tidak dapat ditarik.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitWithdraw} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-member-number">Nomor Anggota *</Label>
                                        <Input
                                            id="withdraw-member-number"
                                            type="text"
                                            value={withdrawData.member_number}
                                            onChange={(e) => setWithdrawData('member_number', e.target.value)}
                                            placeholder="KMP-2026-XXXX"
                                            required
                                        />
                                        {withdrawErrors.member_number && (
                                            <p className="text-xs text-destructive">{withdrawErrors.member_number}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-amount">Jumlah Penarikan (Rp) *</Label>
                                        <Input
                                            id="withdraw-amount"
                                            type="number"
                                            value={withdrawData.amount}
                                            onChange={(e) => setWithdrawData('amount', e.target.value)}
                                            placeholder="100000"
                                            required
                                        />
                                        {withdrawErrors.amount && <p className="text-xs text-destructive">{withdrawErrors.amount}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-date">Tanggal Tarik *</Label>
                                        <Input
                                            id="withdraw-date"
                                            type="date"
                                            value={withdrawData.transaction_date}
                                            onChange={(e) => setWithdrawData('transaction_date', e.target.value)}
                                            required
                                        />
                                        {withdrawErrors.transaction_date && (
                                            <p className="text-xs text-destructive">{withdrawErrors.transaction_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-description">Keterangan</Label>
                                        <Input
                                            id="withdraw-description"
                                            value={withdrawData.description}
                                            onChange={(e) => setWithdrawData('description', e.target.value)}
                                            placeholder="Opsional"
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" variant="destructive" disabled={withdrawProcessing}>
                                            {withdrawProcessing ? 'Memproses...' : 'Proses Penarikan'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Modal Catat Setoran */}
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Catat Setoran
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Catat Setoran Simpanan</DialogTitle>
                                    <DialogDescription>Masukkan nomor anggota (misal: KMP-2026-0001) dan detail setoran.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitDeposit} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="member_number">Nomor Anggota *</Label>
                                        <Input
                                            id="member_number"
                                            type="text"
                                            value={data.member_number}
                                            onChange={(e) => setData('member_number', e.target.value)}
                                            placeholder="KMP-2026-XXXX"
                                            required
                                        />
                                        {errors.member_number && <p className="text-xs text-destructive">{errors.member_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Jenis Simpanan *</Label>
                                        <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pokok">Pokok</SelectItem>
                                                <SelectItem value="wajib">Wajib</SelectItem>
                                                <SelectItem value="sukarela">Sukarela</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Jumlah (Rp) *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="100000"
                                            required
                                        />
                                        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_date">Tanggal Setor *</Label>
                                        <Input
                                            id="transaction_date"
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={(e) => setData('transaction_date', e.target.value)}
                                            required
                                        />
                                        {errors.transaction_date && <p className="text-xs text-destructive">{errors.transaction_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Keterangan</Label>
                                        <Input
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Opsional"
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-lg border">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau nomor anggota..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={filters.type || 'all'} onValueChange={handleTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                <SelectItem value="pokok">Pokok</SelectItem>
                                <SelectItem value="wajib">Wajib</SelectItem>
                                <SelectItem value="sukarela">Sukarela</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable columns={columns} data={transactions.data} links={transactions.links} />
            </div>
        </>
    );
}

SavingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Simpanan',
            href: web_savings_index(),
        },
    ],
};
