import { Head, useForm, router, Link } from '@inertiajs/react';
import { web_cash_index, web_cash_store_mutasi } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    ArrowUpDown, 
    Search, 
    Landmark, 
    ArrowUpRight, 
    ArrowDownRight,
    Wallet,
    Building2,
    History,
    CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CashAccount {
    id: number;
    name: string;
    type: string;
    account_number: string | null;
    balance: string;
    status: string;
    transactions_count: number;
}

interface CashTransaction {
    id: number;
    cash_account_id: number;
    amount: string;
    type: string;
    category: string;
    description: string | null;
    transaction_date: string;
    account: { name: string };
}

interface CashIndexProps {
    accounts: CashAccount[];
    transactions: {
        data: CashTransaction[];
        links: any[];
    };
    filters: {
        search?: string;
        account_id?: string;
    };
}

// KATEGORI STANDAR KOPERASI
const MUTASI_CATEGORIES = [
    { label: 'Gaji & Honor', value: 'gaji', type: 'expense' },
    { label: 'Listrik, Air & Internet', value: 'utilitas', type: 'expense' },
    { label: 'Alat Tulis & Kantor', value: 'atk', type: 'expense' },
    { label: 'Sewa Gedung', value: 'sewa', type: 'expense' },
    { label: 'Pendapatan Administrasi', value: 'admin_fee', type: 'income' },
    { label: 'Pendapatan Lain-lain', value: 'income_other', type: 'income' },
    { label: 'Beban Lain-lain', value: 'expense_other', type: 'expense' },
];

export default function CashIndex({ accounts, transactions, filters }: CashIndexProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, setData, post, processing, errors, reset } = useForm({
        cash_account_id: accounts[0]?.id.toString() || '',
        amount: '',
        type: 'expense',
        category: 'utilitas',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        router.get(web_cash_index(), { 
            search: debouncedSearch,
            account_id: filters.account_id
        }, { preserveState: true, replace: true });
    }, [debouncedSearch]);

    const handleAccountFilter = (val: string) => {
        router.get(web_cash_index(), { 
            search: searchTerm,
            account_id: val === 'all' ? '' : val
        }, { preserveState: true });
    };

    const submitMutasi = (e: React.FormEvent) => {
        e.preventDefault();
        post(web_cash_store_mutasi(), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success('Mutasi kas berhasil dicatat');
            },
            onError: () => {
                toast.error('Gagal mencatat mutasi. Periksa kembali form.');
            }
        });
    };

    const columns: ColumnDef<CashTransaction>[] = [
        {
            accessorKey: "transaction_date",
            header: "Tanggal",
            cell: ({ row }) => format(new Date(row.original.transaction_date), 'dd MMM yyyy', { locale: localeId })
        },
        {
            accessorKey: "account.name",
            header: "Akun Kas/Bank",
            cell: ({ row }) => <span className="font-medium text-xs text-muted-foreground">{row.original.account.name}</span>
        },
        {
            accessorKey: "category",
            header: "Kategori",
            cell: ({ row }) => {
                const categoryValue = row.original.category;
                const categoryObj = MUTASI_CATEGORIES.find(c => c.value === categoryValue);
                return (
                    <span className="capitalize text-black dark:text-white font-bold text-[11px] tracking-tight">
                        {categoryObj ? categoryObj.label : categoryValue.replace('_', ' ')}
                    </span>
                )
            }
        },
        {
            accessorKey: "description",
            header: "Keterangan",
            cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.description || '-'}</span>
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right">Nominal</div>,
            cell: ({ row }) => {
                const isIncome = row.original.type === 'income';
                return (
                    <div className={cn(
                        "text-right font-mono font-bold",
                        isIncome ? "text-emerald-600" : "text-red-600"
                    )}>
                        {isIncome ? '+' : '-'}{formatCurrency(parseFloat(row.original.amount))}
                    </div>
                );
            }
        },
    ];

    return (
        <>
            <Head title="Kas & Bank" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Landmark className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Manajemen Kas & Bank</h2>
                        </div>
                        <p className="text-muted-foreground">Kelola arus kas masuk/keluar dan pantau saldo rekening koperasi.</p>
                    </div>

                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Catat Mutasi Manual
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Input Mutasi Kas Manual</DialogTitle>
                                <DialogDescription>Gunakan ini untuk mencatat biaya operasional, gaji, atau pendapatan lain.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitMutasi} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cash_account_id">Pilih Rekening *</Label>
                                    <Select value={data.cash_account_id} onValueChange={(v) => setData('cash_account_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Jenis Mutasi *</Label>
                                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Masuk (Income)</SelectItem>
                                                <SelectItem value="expense">Keluar (Expense)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Kategori *</Label>
                                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MUTASI_CATEGORIES.filter(c => c.type === data.type).map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Jumlah (Rp) *</Label>
                                    <Input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal *</Label>
                                    <Input type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Keterangan *</Label>
                                    <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Contoh: Pembayaran listrik bulan Mei" required />
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>Simpan Mutasi</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Account Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {accounts.map(acc => (
                        <Card key={acc.id} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className={cn(
                                "absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity",
                                acc.type === 'bank' ? "text-blue-500" : "text-emerald-500"
                            )}>
                                {acc.type === 'bank' ? <CreditCard className="h-12 w-12" /> : <Wallet className="h-12 w-12" />}
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{acc.name}</CardTitle>
                                <CardDescription className="text-[10px] font-mono">{acc.account_number || 'Internal Cash'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(parseFloat(acc.balance))}</div>
                                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                    <span>{acc.transactions_count} Transaksi</span>
                                    <span className="text-emerald-500">Active</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters & Table */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-lg border">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari keterangan atau kategori..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={filters.account_id || 'all'} onValueChange={handleAccountFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Rekening" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Rekening</SelectItem>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <History className="h-4 w-4 text-primary" />
                        <h3>Riwayat Mutasi Terkini</h3>
                    </div>
                    <DataTable columns={columns} data={transactions.data} links={transactions.links} />
                </div>

            </div>
        </>
    );
}

CashIndex.layout = {
    breadcrumbs: [
        { title: 'Kas & Bank', href: web_cash_index() },
    ],
};
