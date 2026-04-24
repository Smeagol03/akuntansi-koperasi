import { Head, Link, usePage, router } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Users, Wallet, CreditCard, BarChart2, ShieldCheck, Zap, ArrowRight, CheckCircle, Scale, Landmark, FileText, LogOut, Clock } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth, flash } = usePage<{ auth: any, flash: { error?: string, message?: string } }>().props;

    const handleLogout = () => {
        router.post('/logout');
    };

    const isAdmin = auth.user?.role === 'admin';

    const features = [
        {
            icon: Users,
            title: 'Manajemen Anggota',
            description: 'Sistem pendataan anggota koperasi yang terintegrasi dengan penomoran otomatis dan validasi data yang ketat.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
        {
            icon: Landmark,
            title: 'Simpanan Kolektif',
            description: 'Pengelolaan simpanan pokok, wajib, dan sukarela secara transparan dengan audit log untuk setiap transaksi.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
        {
            icon: Scale,
            title: 'Kredit & Pinjaman',
            description: 'Verifikasi pengajuan pinjaman dengan kalkulasi bunga flat yang presisi dan jadwal angsuran yang mengikat.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
        {
            icon: FileText,
            title: 'Pelaporan Resmi',
            description: 'Hasilkan Laporan Sisa Hasil Usaha (SHU) dan neraca keuangan yang sesuai dengan standar akuntansi koperasi.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
        {
            icon: ShieldCheck,
            title: 'Otoritas & Keamanan',
            description: 'Protokol keamanan berlapis dengan autentikasi dua faktor untuk melindungi data finansial anggota.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
        {
            icon: BarChart2,
            title: 'Analisis Pertumbuhan',
            description: 'Dashboard eksekutif untuk memantau likuiditas, piutang, dan kesehatan finansial koperasi secara real-time.',
            color: 'text-red-700',
            bg: 'bg-red-50',
        },
    ];

    const highlights = [
        'ID Anggota Standar Nasional',
        'Audit Trail Transaksi',
        'Kalkulasi SHU Otomatis',
        'Keamanan Data Terenkripsi',
        'Laporan Neraca Standar PSAK',
        'Manajemen Aset Real-time',
    ];

    return (
        <>
            <Head title="Koperasi Merah Putih — Sistem Informasi Akuntansi Terpadu">
                <meta
                    name="description"
                    content="Sistem akuntansi koperasi profesional untuk Koperasi Merah Putih. Kelola anggota, simpanan, dan pinjaman dengan standar akuntansi yang ketat."
                />
            </Head>

            <div className="min-h-screen bg-white text-slate-900 font-sans">
                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-red-700 bg-white shadow-sm">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center bg-red-700 rounded-none">
                                <Landmark className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black tracking-tighter uppercase text-red-700">Koperasi</span>
                                <span className="text-xl font-black tracking-tighter uppercase text-slate-900">Merah Putih</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <div className="flex items-center gap-4">
                                    {isAdmin ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex items-center gap-2 bg-red-700 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-red-800 rounded-none"
                                        >
                                            Dashboard <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 border border-slate-200">
                                            <Clock className="h-4 w-4 text-orange-600" />
                                            <span className="text-xs font-black uppercase tracking-tighter text-slate-600">
                                                Menunggu Verifikasi
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-red-700 cursor-pointer"
                                    >
                                        Keluar <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-red-700"
                                    >
                                        Masuk
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 bg-red-700 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-red-800 rounded-none border-2 border-red-700"
                                        >
                                            Registrasi
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {flash.error && (
                    <div className="fixed top-24 left-1/2 z-60 -translate-x-1/2 w-full max-w-xl px-6">
                        <div className="bg-red-50 border-2 border-red-700 p-4 flex items-center gap-3 text-red-700 shadow-[8px_8px_0px_0px_rgba(185,28,28,0.1)]">
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-black uppercase tracking-tighter">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Hero Section */}
                <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-32">
                    <div className="absolute inset-0 z-0 opacity-5">
                        <div className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 border-2 border-red-700 bg-white px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-red-700 rounded-none">
                            Official Platform
                        </div>

                        {/* Headline */}
                        <h1 className="mb-8 max-w-5xl text-6xl font-black leading-tight tracking-tighter text-slate-900 md:text-7xl lg:text-8xl uppercase italic">
                            Integritas <span className="text-red-700">Finansial</span><br />
                            <span className="bg-red-700 px-4 text-white not-italic">Koperasi Indonesia</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mb-12 max-w-3xl text-xl font-medium leading-relaxed text-slate-600">
                            Transformasi digital Koperasi Merah Putih dengan sistem akuntansi terstandarisasi, transparan, dan akuntabel untuk kesejahteraan bersama.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            {auth.user ? (
                                isAdmin ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center justify-center gap-3 bg-red-700 px-10 py-5 text-lg font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_0px_rgba(185,28,28,0.2)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none"
                                    >
                                        Masuk ke Panel Kontrol <ArrowRight className="h-6 w-6" />
                                    </Link>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="border-4 border-orange-500 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(249,115,22,0.1)] rounded-none">
                                            <div className="mb-4 flex justify-center text-orange-500">
                                                <ShieldCheck className="h-12 w-12" />
                                            </div>
                                            <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-slate-900">Akses Terbatas</h3>
                                            <p className="max-w-md text-lg font-medium text-slate-600">
                                                Akun Anda telah terdaftar namun memerlukan verifikasi dari pengurus pusat sebelum dapat mengakses dashboard keuangan.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center justify-center gap-3 border-4 border-slate-900 bg-white px-10 py-5 text-lg font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-900 hover:text-white rounded-none cursor-pointer"
                                        >
                                            Keluar dari Sesi <LogOut className="h-6 w-6" />
                                        </button>
                                    </div>
                                )
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center gap-3 bg-red-700 px-10 py-5 text-lg font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_0px_rgba(185,28,28,0.2)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none"
                                        >
                                            Mulai Sekarang <ArrowRight className="h-6 w-6" />
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center gap-3 border-4 border-slate-900 bg-white px-10 py-5 text-lg font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-900 hover:text-white rounded-none"
                                    >
                                        Akses Akun
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Highlight List */}
                        <div className="mt-20 grid grid-cols-2 gap-x-12 gap-y-4 md:grid-cols-3">
                            {highlights.map((item) => (
                                <div key={item} className="flex items-center gap-3 text-left font-bold uppercase tracking-tighter text-slate-500">
                                    <CheckCircle className="h-5 w-5 text-red-700 shrink-0" />
                                    <span className="text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-y-4 border-slate-900 bg-white px-6 py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-20 flex flex-col items-start md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-slate-900 md:text-5xl lg:text-6xl italic">
                                    Pilar Utama <span className="text-red-700">Operasional</span>
                                </h2>
                                <div className="h-2 w-24 bg-red-700"></div>
                            </div>
                            <p className="mt-8 max-w-md text-lg font-medium text-slate-600 md:mt-0">
                                Setiap fitur dirancang untuk memenuhi regulasi perkoperasian nasional dengan sistem keamanan data perbankan.
                            </p>
                        </div>

                        <div className="grid gap-px bg-slate-200 border border-slate-200 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group bg-white p-10 transition-all hover:z-10 hover:outline hover:outline-red-700"
                                >
                                    <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center border-2 border-red-700 bg-white rounded-none`}>
                                        <feature.icon className={`h-8 w-8 text-red-700`} />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-black uppercase tracking-tighter text-slate-900">{feature.title}</h3>
                                    <p className="text-lg font-medium leading-relaxed text-slate-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="bg-red-700 px-6 py-24 text-white">
                    <div className="mx-auto max-w-5xl text-center">
                        <h2 className="mb-8 text-5xl font-black uppercase tracking-tighter italic md:text-7xl">
                            Gabung Dalam Ekosistem<br />Koperasi Digital
                        </h2>
                        <p className="mb-12 text-xl font-bold uppercase tracking-widest text-red-100 opacity-80">
                            Wujudkan kemandirian ekonomi dengan transparansi teknologi.
                        </p>
                        <div className="flex flex-col justify-center gap-6 sm:flex-row">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center gap-3 bg-white px-12 py-5 text-xl font-black uppercase tracking-widest text-red-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none"
                                >
                                    Panel Dashboard <ArrowRight className="h-6 w-6" />
                                </Link>
                            ) : (
                                canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center gap-3 bg-white px-12 py-5 text-xl font-black uppercase tracking-widest text-red-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none"
                                    >
                                        Registrasi Sekarang <ArrowRight className="h-6 w-6" />
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t-4 border-slate-900 bg-white px-6 py-16">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center bg-red-700 rounded-none">
                                <Landmark className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-black uppercase tracking-tighter">Koperasi Merah Putih</span>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                © 2026 Koperasi Merah Putih. Hak Cipta Dilindungi Undang-Undang.
                            </p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                Built with Laravel & React · Standardized Financial System
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
