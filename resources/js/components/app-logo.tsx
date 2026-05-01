import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center rounded-none bg-[#D80027] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <AppLogoIcon className="size-8 fill-current" />
            </div>
            <div className="ml-5 flex flex-col items-start justify-center leading-none text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-[#D80027] dark:text-red-500 mb-1">
                    Koperasi
                </span>
                <span className="text-[20px] font-black uppercase tracking-[-0.04em] text-slate-900 dark:text-white">
                    Merah Putih
                </span>
            </div>
        </>
    );
}
