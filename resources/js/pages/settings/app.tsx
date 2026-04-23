import { Head, useForm, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Percent, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SavingConfig {
    type: string;
    interest_rate: number;
}

interface AppSettingsProps {
    settings: {
        app_name: string;
        app_address: string;
        default_interest_method: string;
        default_penalty_rate: string;
    };
    saving_configs: SavingConfig[];
    system_status: {
        has_coa: boolean;
        coa_count: number;
    }
}

export default function AppSettings({ settings, saving_configs, system_status }: AppSettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        app_name: settings.app_name || '',
        app_address: settings.app_address || '',
        default_interest_method: settings.default_interest_method || 'flat',
        default_penalty_rate: settings.default_penalty_rate || '0',
        interest_rates: (saving_configs || []).reduce((acc, curr) => ({ ...acc, [curr.type]: curr.interest_rate }), {}) as Record<string, number>
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/app', {
            onSuccess: () => toast.success('Pengaturan berhasil diperbarui'),
            onError: () => toast.error('Gagal memperbarui pengaturan.'),
        });
    };

    const handleInitialize = () => {
        router.post('/settings/app/initialize', {}, {
            onSuccess: () => toast.success('Sistem berhasil di-inisialisasi!'),
        });
    };

    return (
        <>
            <Head title="Pengaturan Koperasi" />

            <div className="space-y-10 pb-20">
                {/* System Integrity Check Card */}
                {!system_status.has_coa ? (
                    <Card className="border-destructive bg-destructive/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-5 w-5" />
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">Sistem Belum Siap</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" onClick={handleInitialize} className="w-full gap-2">
                                <Zap className="h-4 w-4" /> Generate Master Data & COA
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Infrastruktur Keuangan Aktif</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-mono">{system_status.coa_count} Akun Terdaftar</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-10">
                    {/* SECTION 1: IDENTITAS */}
                    <section className="space-y-6">
                        <Heading
                            title="Identitas Koperasi"
                            description="Kelola nama dan alamat resmi lembaga Anda."
                            variant="small"
                        />
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="app_name">Nama Koperasi</Label>
                                <Input id="app_name" value={data.app_name} onChange={(e) => setData('app_name', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="app_address">Alamat Lengkap</Label>
                                <Input id="app_address" value={data.app_address} onChange={(e) => setData('app_address', e.target.value)} required />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: KEBIJAKAN BUNGA & DENDA */}
                    <section className="space-y-6 pt-6 border-t">
                        <Heading
                            title="Kebijakan & Suku Bunga"
                            description="Atur imbal hasil simpanan dan beban biaya pinjaman."
                            variant="small"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Percent className="h-3 w-3" /> Bunga Simpanan (Per Tahun)
                                </h4>
                                {(saving_configs || []).map((config) => (
                                    <div key={config.type} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                                        <Label className="capitalize font-medium text-xs">{config.type}</Label>
                                        <div className="flex items-center gap-2 w-24">
                                            <Input 
                                                type="number" 
                                                step="0.1" 
                                                className="h-8 text-right font-mono text-xs"
                                                value={data.interest_rates[config.type] || 0} 
                                                onChange={(e) => setData('interest_rates', { ...data.interest_rates, [config.type]: parseFloat(e.target.value) })}
                                            />
                                            <span className="text-xs font-bold">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Percent className="h-3 w-3" /> Parameter Pinjaman
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Metode Bunga Default</Label>
                                        <Select value={data.default_interest_method} onValueChange={(v) => setData('default_interest_method', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flat">Flat (Tetap)</SelectItem>
                                                <SelectItem value="effective">Efektif (Anuitas)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Denda Keterlambatan (%) / Hari</Label>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            value={data.default_penalty_rate} 
                                            onChange={(e) => setData('default_penalty_rate', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t">
                        <Button type="submit" disabled={processing} className="w-full md:w-auto px-10">
                            Simpan Seluruh Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AppSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Koperasi', href: '/settings/app' },
    ],
};
