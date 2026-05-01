import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-10"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-8">
                            <div className="grid gap-3">
                                <Label 
                                    htmlFor="email" 
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white"
                                >
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label 
                                        htmlFor="password" 
                                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white"
                                    >
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[#D80027] underline underline-offset-4 decoration-1"
                                            tabIndex={5}
                                        >
                                            Lupa?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="size-5 rounded-none border-[2px] border-black dark:border-white data-[state=checked]:bg-[#D80027] data-[state=checked]:border-[#D80027]"
                                />
                                <Label 
                                    htmlFor="remember" 
                                    className="text-sm font-bold uppercase tracking-tight text-black dark:text-white cursor-pointer select-none"
                                >
                                    Ingat Pilihan
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-16 w-full rounded-none bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xl hover:bg-[#D80027] dark:hover:bg-[#D80027] hover:text-white transition-none active:translate-x-1 active:translate-y-1"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="size-6 border-white" /> : 'Masuk ke Sistem'}
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                Belum memiliki akun?{' '}
                                <TextLink 
                                    href={register()} 
                                    tabIndex={5}
                                    className="text-black dark:text-white hover:text-[#D80027] transition-none underline underline-offset-4 decoration-2"
                                >
                                    Daftar Akun
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-8 p-4 border-[2px] border-[#D80027] text-center text-xs font-bold uppercase tracking-widest text-[#D80027] animate-in fade-in">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Login Pengguna',
    description: 'Masukkan kredensial Anda untuk akses sistem yang aman',
};
