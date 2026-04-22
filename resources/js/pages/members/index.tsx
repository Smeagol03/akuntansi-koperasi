import { Head, useForm, router } from '@inertiajs/react';
import { dashboard, web_members_index, web_members_store, web_members_update, web_members_destroy } from '@/routes';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface Member {
    id: number;
    member_number: string;
    name: string;
    address: string;
    phone_number: string | null;
    join_date: string;
    status: string;
    total_simpanan: string | null;
    total_pinjaman: string | null;
}

interface MembersProps {
    members: {
        data: Member[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function MembersIndex({ members: membersData, filters }: MembersProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Form: Tambah Anggota
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        address: '',
        phone_number: '',
        join_date: new Date().toISOString().split('T')[0],
        status: 'active',
    });

    // Form: Edit Anggota
    const {
        data: editData,
        setData: setEditData,
        patch,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        address: '',
        phone_number: '',
        join_date: '',
        status: 'active',
    });

    // Isi form edit saat member dipilih
    useEffect(() => {
        if (editingMember) {
            setEditData('name', editingMember.name);
            setEditData('address', editingMember.address);
            setEditData('phone_number', editingMember.phone_number || '');
            setEditData('join_date', editingMember.join_date);
            setEditData('status', editingMember.status);
        }
    }, [editingMember]);

    // Handle Search & Filter
    useEffect(() => {
        router.get(
            web_members_index(),
            { search: debouncedSearch, status: filters.status },
            { preserveState: true, replace: true },
        );
    }, [debouncedSearch]);

    const handleStatusFilter = (val: string) => {
        router.get(web_members_index(), { search: searchTerm, status: val === 'all' ? '' : val }, { preserveState: true });
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(web_members_store(), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success('Anggota berhasil ditambahkan dengan nomor ID otomatis');
            },
            onError: () => {
                toast.error('Gagal menambahkan anggota. Periksa kembali form Anda.');
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        patch(web_members_update({ member: editingMember.id }), {
            onSuccess: () => {
                setEditingMember(null);
                resetEdit();
                toast.success('Data anggota berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data anggota.');
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingMember) return;
        router.delete(web_members_destroy({ member: deletingMember.id }), {
            onSuccess: () => {
                setDeletingMember(null);
                toast.success(`Anggota ${deletingMember.name} berhasil dihapus`);
            },
            onError: () => {
                toast.error('Gagal menghapus anggota.');
            },
        });
    };

    // Columns Definition for TanStack Table
    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: 'member_number',
            header: 'No. Anggota',
            cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.member_number}</span>,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4">
                    Nama
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'join_date',
            header: 'Tgl. Bergabung',
            cell: ({ row }) => format(new Date(row.original.join_date), 'dd MMM yyyy', { locale: id }),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                        {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                );
            },
        },
        {
            id: 'savings_total',
            header: () => <div className="text-right">Total Simpanan</div>,
            cell: ({ row }) => {
                const total = parseFloat(row.original.total_simpanan || '0');
                return <div className={`text-right font-medium ${total < 0 ? 'text-red-500' : ''}`}>{formatCurrency(total)}</div>;
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMember(member)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Anggota
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeletingMember(member)}
                                className="text-red-600 focus:text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Anggota
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Manajemen Anggota" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Anggota Koperasi</h2>
                        <p className="text-muted-foreground">Kelola data anggota, status, dan pantau saldo simpanan/pinjaman.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Modal Tambah Anggota */}
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tambah Anggota Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan data anggota baru. Nomor anggota dibuat otomatis oleh sistem.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitAdd} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat *</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            required
                                        />
                                        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number">No. HP</Label>
                                            <Input
                                                id="phone_number"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="join_date">Tanggal Gabung *</Label>
                                            <Input
                                                id="join_date"
                                                type="date"
                                                value={data.join_date}
                                                onChange={(e) => setData('join_date', e.target.value)}
                                                required
                                            />
                                            {errors.join_date && <p className="text-xs text-destructive">{errors.join_date}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Anggota'}
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
                        <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable columns={columns} data={membersData.data} links={membersData.links} />
            </div>

            {/* Modal Edit Anggota */}
            <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Data Anggota</DialogTitle>
                        <DialogDescription>
                            Perbarui data anggota <strong>{editingMember?.member_number}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Lengkap *</Label>
                            <Input
                                id="edit-name"
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                required
                            />
                            {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Alamat *</Label>
                            <Input
                                id="edit-address"
                                value={editData.address}
                                onChange={(e) => setEditData('address', e.target.value)}
                                required
                            />
                            {editErrors.address && <p className="text-xs text-destructive">{editErrors.address}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">No. HP</Label>
                                <Input
                                    id="edit-phone"
                                    value={editData.phone_number}
                                    onChange={(e) => setEditData('phone_number', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-join-date">Tanggal Gabung *</Label>
                                <Input
                                    id="edit-join-date"
                                    type="date"
                                    value={editData.join_date}
                                    onChange={(e) => setEditData('join_date', e.target.value)}
                                    required
                                />
                                {editErrors.join_date && <p className="text-xs text-destructive">{editErrors.join_date}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={editData.status} onValueChange={(val) => setEditData('status', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* AlertDialog Konfirmasi Hapus */}
            <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Anggota?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus anggota <strong>{deletingMember?.name}</strong> ({deletingMember?.member_number}). Tindakan
                            ini akan menghapus seluruh data simpanan dan pinjaman terkait dan <strong>tidak dapat dibatalkan</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

MembersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Anggota',
            href: web_members_index(),
        },
    ],
};
