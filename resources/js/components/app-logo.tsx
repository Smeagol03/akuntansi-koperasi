import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-none bg-red-700 text-white">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-3 flex flex-col items-start leading-none text-left">
                <span className="text-xs font-black uppercase tracking-tighter text-red-700">
                    Koperasi
                </span>
                <span className="text-xs font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                    Merah Putih
                </span>
            </div>
        </>
    );
}
