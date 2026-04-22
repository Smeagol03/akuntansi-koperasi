import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Users, Wallet, CreditCard, BarChart2, ShieldCheck, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    const features = [
        {
            icon: Users,
            title: 'Manajemen Anggota',
            description: 'Kelola data seluruh anggota koperasi dengan nomor ID otomatis, riwayat transaksi lengkap, dan filter pencarian canggih.',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            icon: Wallet,
            title: 'Simpanan Lengkap',
            description: 'Catat simpanan pokok, wajib, dan sukarela. Dukungan penuh untuk setoran dan penarikan dengan rekap per anggota.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            icon: CreditCard,
            title: 'Manajemen Pinjaman',
            description: 'Proses pengajuan pinjaman, persetujuan, perhitungan bunga flat otomatis, dan pencatatan angsuran yang akurat.',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
        },
        {
            icon: BarChart2,
            title: 'Laporan Keuangan',
            description: 'Pantau kesehatan keuangan koperasi dengan rekap bulanan simpanan, pinjaman, SHU, dan piutang beredar.',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        },
        {
            icon: ShieldCheck,
            title: 'Keamanan Terjamin',
            description: 'Akses hanya untuk pengurus yang berwenang. Didukung autentikasi dua faktor (2FA) untuk keamanan ekstra.',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
        },
        {
            icon: Zap,
            title: 'Cepat & Responsif',
            description: 'Dibangun dengan teknologi modern (Laravel + React) untuk pengalaman yang cepat, mulus, dan nyaman di semua perangkat.',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
        },
    ];

    const highlights = [
        'Nomor anggota otomatis (KMP-YYYY-XXXX)',
        'Simulasi angsuran pinjaman real-time',
        'Laporan rekap 12 bulan terakhir',
        'Dukungan dark mode & light mode',
        'Dashboard KPI lengkap sekilas pandang',
        'Perhitungan SHU dari pendapatan bunga',
    ];

    return (
        <>
            <Head title="KoperasiKu — Sistem Akuntansi Koperasi Digital">
                <meta
                    name="description"
                    content="Sistem akuntansi koperasi digital yang lengkap. Kelola anggota, simpanan, pinjaman, dan laporan keuangan dalam satu platform yang mudah digunakan."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Wallet className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold">KoperasiKu</span>
                        </div>

                        {/* CTA Buttons */}
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        >
                                            Mulai Gratis
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-16 text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        <Zap className="h-3 w-3" />
                        Sistem Akuntansi Koperasi Digital
                    </div>

                    {/* Headline */}
                    <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                        Kelola Koperasi{' '}
                        <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                            Lebih Mudah
                        </span>{' '}
                        &amp; Lebih Cerdas
                    </h1>

                    {/* Subtitle */}
                    <p className="mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                        Platform akuntansi koperasi digital yang memudahkan pengurus mengelola anggota, simpanan, pinjaman, dan laporan
                        keuangan dalam satu dashboard yang intuitif.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                            >
                                Buka Dashboard <ArrowRight className="h-5 w-5" />
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                                    >
                                        Mulai Sekarang <ArrowRight className="h-5 w-5" />
                                    </Link>
                                )}
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                                >
                                    Masuk ke Akun
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Highlight List */}
                    <div className="mt-14 flex flex-wrap justify-center gap-3">
                        {highlights.map((item) => (
                            <div key={item} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section className="px-4 py-24 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Semua yang Koperasi Butuhkan
                            </h2>
                            <p className="mx-auto max-w-2xl text-muted-foreground">
                                Dari pendaftaran anggota hingga laporan SHU, semua fitur dirancang khusus untuk kebutuhan operasional koperasi simpan pinjam.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                >
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="px-4 pb-24 sm:px-6">
                    <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border border-primary/20 p-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">
                            Siap Digitalisasi Koperasi Anda?
                        </h2>
                        <p className="mb-8 text-muted-foreground">
                            Bergabunglah dan mulai kelola keuangan koperasi dengan lebih efisien, transparan, dan akurat.
                        </p>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                            >
                                Buka Dashboard <ArrowRight className="h-5 w-5" />
                            </Link>
                        ) : (
                            canRegister && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                                >
                                    Daftar Sekarang — Gratis <ArrowRight className="h-5 w-5" />
                                </Link>
                            )
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border px-4 py-8 text-center sm:px-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                            <Wallet className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="font-semibold">KoperasiKu</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Sistem Akuntansi Koperasi Digital · Dibangun dengan Laravel &amp; React
                    </p>
                </footer>
            </div>
        </>
    );
}
