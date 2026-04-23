import { Head, Link } from '@inertiajs/react';
import { web_members_index, web_members_show } from '@/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, List, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
    User, 
    Wallet, 
    CreditCard, 
    Calendar, 
    Phone, 
    MapPin, 
    ArrowLeft, 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    FileText,
    History
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MemberShowProps {
    member: {
        id: number;
        member_number: string;
        name: string;
        address: string;
        phone_number: string | null;
        join_date: string;
        status: string;
        profile_photo_path: string | null;
        notes: string | null;
        emergency_contact_name: string | null;
        emergency_contact_phone: string | null;
        savings: any[];
        loans: any[];
    };
    summary: {
        total_pokok: number;
        total_wajib: number;
        total_sukarela: number;
        grand_total_simpanan: number;
        pinjaman_aktif: number;
        total_hutang: number;
    };
}

export default function MemberShow({ member, summary }: MemberShowProps) {
    return (
        <>
            <Head title={`Profil: ${member.name}`} />
            
            <div className="flex flex-col gap-6 p-4 md:p-6">
                
                {/* Header / Back Navigation */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={web_members_index()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Detail Anggota</h2>
                        <p className="text-muted-foreground font-mono text-sm">{member.member_number}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    
                    {/* Left Column: ID Card & Info */}
                    <div className="md:col-span-4 space-y-6">
                        
                        {/* Digital ID Card */}
                        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
                            <div className="h-2 bg-primary w-full" />
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20">
                                        {member.profile_photo_path ? (
                                            <img src={member.profile_photo_path} alt={member.name} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <User className="h-12 w-12 text-primary" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold">{member.name}</h3>
                                    <span className={cn(
                                        "mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
                                        member.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {member.status === 'active' ? 'Anggota Aktif' : 'Tidak Aktif'}
                                    </span>
                                    
                                    <div className="mt-6 w-full space-y-3 text-sm text-left">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Gabung: {format(new Date(member.join_date), 'dd MMMM yyyy', { locale: localeId })}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{member.phone_number || 'Tidak ada nomor'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 items-start">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span className="line-clamp-2">{member.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Summary Small Cards */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    Total Simpanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(summary.grand_total_simpanan)}</div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Pokok & Wajib</span>
                                        <span>{formatCurrency(summary.total_pokok + summary.total_wajib)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Sukarela</span>
                                        <span>{formatCurrency(summary.total_sukarela)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-secondary" />
                                    Posisi Pinjaman
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-secondary">{formatCurrency(summary.total_hutang)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary.pinjaman_aktif} Pinjaman Sedang Berjalan
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Tabs */}
                    <div className="md:col-span-8">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="overview">Informasi</TabsTrigger>
                                <TabsTrigger value="savings">Riwayat Simpanan</TabsTrigger>
                                <TabsTrigger value="loans">Daftar Pinjaman</TabsTrigger>
                            </TabsList>
                            
                            {/* Tab: Overview / Profile Detail */}
                            <TabsContent value="overview" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Catatan & Kontak Darurat</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                                    Kontak Darurat
                                                </h4>
                                                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                                    <p className="text-sm font-medium">{member.emergency_contact_name || '-'}</p>
                                                    <p className="text-xs text-muted-foreground">{member.emergency_contact_phone || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    Catatan Internal
                                                </h4>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                        {member.notes || 'Belum ada catatan untuk anggota ini.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Savings History */}
                            <TabsContent value="savings">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>10 Transaksi Terakhir</CardTitle>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/savings?search=${member.member_number}`}>
                                                Lihat Semua <History className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tanggal</TableHead>
                                                        <TableHead>Jenis</TableHead>
                                                        <TableHead className="text-right">Jumlah</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {member.savings && member.savings.length > 0 ? (
                                                        member.savings.map((trx) => (
                                                            <TableRow key={trx.id}>
                                                                <TableCell>{format(new Date(trx.transaction_date), 'dd MMM yyyy')}</TableCell>
                                                                <TableCell className="capitalize">{trx.type}</TableCell>
                                                                <TableCell className="text-right font-medium text-primary">
                                                                    +{formatCurrency(parseFloat(trx.amount))}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                                                Belum ada riwayat simpanan.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Loans & Schedules */}
                            <TabsContent value="loans" className="space-y-6">
                                {member.loans && member.loans.length > 0 ? (
                                    member.loans.map((loan) => (
                                        <Card key={loan.id} className={cn(loan.status === 'active' ? "border-primary/20" : "")}>
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                            Pinjaman {formatCurrency(parseFloat(loan.amount))}
                                                            {loan.status === 'active' && (
                                                                <Button variant="outline" size="sm" className="ml-4 h-7 text-[10px] uppercase tracking-wider" asChild>
                                                                    <a href={`/loans/${loan.id}/export`} target="_blank">
                                                                        <FileText className="mr-1 h-3 w-3" /> Cetak Jadwal
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Diajukan pada {format(new Date(loan.apply_date), 'dd MMM yyyy')} • Metode {loan.interest_method.toUpperCase()}
                                                        </CardDescription>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        loan.status === 'active' ? "bg-blue-100 text-blue-800" :
                                                        loan.status === 'paid_off' ? "bg-emerald-100 text-emerald-800" :
                                                        "bg-amber-100 text-amber-800"
                                                    )}>
                                                        {loan.status === 'active' ? 'Berjalan' : loan.status === 'paid_off' ? 'Lunas' : 'Menunggu'}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {/* Amortization Table */}
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Jadwal Angsuran ({loan.term_months} Bulan)
                                                </h4>
                                                <div className="rounded-md border overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-muted/50">
                                                            <TableRow>
                                                                <TableHead className="w-12">#</TableHead>
                                                                <TableHead>Jatuh Tempo</TableHead>
                                                                <TableHead className="text-right">Tagihan</TableHead>
                                                                <TableHead className="text-center">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {loan.schedules && loan.schedules.map((schedule: any) => (
                                                                <TableRow key={schedule.id}>
                                                                    <TableCell className="font-mono text-xs">{schedule.installment_number}</TableCell>
                                                                    <TableCell className="text-sm">{format(new Date(schedule.due_date), 'dd MMM yyyy')}</TableCell>
                                                                    <TableCell className="text-right text-sm font-medium">{formatCurrency(parseFloat(schedule.total_due))}</TableCell>
                                                                    <TableCell className="text-center">
                                                                        {schedule.status === 'paid' ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                                                        ) : (
                                                                            <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="py-10 text-center text-muted-foreground">
                                            Anggota ini belum memiliki riwayat pinjaman.
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                        </Tabs>
                    </div>

                </div>
            </div>
        </>
    );
}

MemberShow.layout = {
    breadcrumbs: [
        { title: 'Anggota', href: web_members_index() },
        { title: 'Profil Detail', href: '#' },
    ],
};
