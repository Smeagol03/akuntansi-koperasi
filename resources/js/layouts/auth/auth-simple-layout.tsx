import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-[100dvh] bg-white dark:bg-black font-sans selection:bg-[#D80027] selection:text-white">
            {/* Split Screen Layout (Swiss Grid Style) */}
            <div className="flex w-full flex-col lg:flex-row">
                
                {/* Left Side: Information & Branding (The 'Manifesto' Section) */}
                <div className="flex w-full lg:w-1/2 flex-col justify-between p-8 md:p-12 xl:p-20 bg-[#D80027] text-white">
                    <div className="flex flex-col gap-12">
                        <Link href={home()} className="flex items-center gap-4 group">
                            <div className="flex aspect-square size-12 items-center justify-center bg-white text-[#D80027]">
                                <AppLogoIcon className="size-8 fill-current" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Platform</span>
                                <span className="text-2xl font-black uppercase tracking-tighter">Merah Putih</span>
                            </div>
                        </Link>

                        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                            <h2 className="text-6xl md:text-7xl xl:text-8xl font-black uppercase leading-[0.85] tracking-[-0.06em]">
                                Akuntansi <br /> 
                                Koperasi <br /> 
                                Modern.
                            </h2>
                            <div className="h-2 w-24 bg-white" />
                            <p className="max-w-md text-xl font-medium tracking-tight leading-snug opacity-90">
                                Sistem manajemen keuangan berbasis grid yang mengedepankan presisi, objektivitas, dan keteraturan.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">
                        <div>Sistem Terintegrasi v2.0</div>
                        <div>&copy; {new Date().getFullYear()} Koperasi Merah Putih</div>
                    </div>
                </div>

                {/* Right Side: Action Section (The 'Functional' Section) */}
                <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 md:p-12 xl:p-24 bg-white dark:bg-black relative">
                    {/* Background Grid Pattern (Subtle) */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[grid-size:40px_40px] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]" />

                    <div className="w-full max-w-[440px] relative z-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">
                                {title}
                            </h1>
                            <p className="text-lg font-medium tracking-tight text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        </div>

                        {/* Functional Content Area */}
                        <div className="border-[3px] border-black dark:border-white p-8 md:p-12 bg-white dark:bg-black shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff]">
                            {children}
                        </div>

                        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            <a href="#" className="hover:text-black dark:hover:text-white transition-none underline underline-offset-4 decoration-2">Privacy Policy</a>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-none underline underline-offset-4 decoration-2">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
