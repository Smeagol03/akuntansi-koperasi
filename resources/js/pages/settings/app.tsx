import { Head, useForm } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SettingsLayout from '@/layouts/settings/layout';
import { toast } from 'sonner';

interface AppSettingsProps {
    settings: {
        app_name: string;
        app_address: string;
        default_interest_method: string;
        default_penalty_rate: string;
    };
}

export default function AppSettings({ settings }: AppSettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        app_name: settings.app_name || '',
        app_address: settings.app_address || '',
        default_interest_method: settings.default_interest_method || 'flat',
        default_penalty_rate: settings.default_penalty_rate || '0',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/app', {
            onSuccess: () => toast.success('Pengaturan koperasi berhasil diperbarui'),
            onError: () => toast.error('Gagal memperbarui pengaturan.'),
        });
    };

    return (
        <SettingsLayout>
            <Head title="Pengaturan Koperasi" />

            <section className="space-y-6">
                <HeadingSmall
                    title="Identitas Koperasi"
                    description="Kelola nama, alamat, dan konfigurasi default operasional koperasi Anda."
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="app_name">Nama Koperasi</Label>
                        <Input
                            id="app_name"
                            value={data.app_name}
                            onChange={(e) => setData('app_name', e.target.value)}
                            required
                        />
                        {errors.app_name && <p className="text-xs text-destructive">{errors.app_name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="app_address">Alamat Lengkap</Label>
                        <Input
                            id="app_address"
                            value={data.app_address}
                            onChange={(e) => setData('app_address', e.target.value)}
                            required
                        />
                        {errors.app_address && <p className="text-xs text-destructive">{errors.app_address}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="default_interest_method">Metode Bunga Default</Label>
                            <Select value={data.default_interest_method} onValueChange={(v) => setData('default_interest_method', v)}>
                                <SelectTrigger id="default_interest_method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flat">Flat (Tetap)</SelectItem>
                                    <SelectItem value="effective">Efektif (Menurun)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default_penalty_rate">Denda Harian Default (%)</Label>
                            <Input
                                id="default_penalty_rate"
                                type="number"
                                step="0.01"
                                value={data.default_penalty_rate}
                                onChange={(e) => setData('default_penalty_rate', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </section>
        </SettingsLayout>
    );
}
