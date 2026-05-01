import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Register Identity" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-10"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-8">
                            <div className="grid gap-3">
                                <Label 
                                    htmlFor="name"
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white"
                                >
                                    Nama Lengkap (Sesuai KTP)
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama Lengkap sesuai KTP"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.name} />
                            </div>

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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <Label 
                                    htmlFor="password"
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white"
                                >
                                    Kata Sandi Akses
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-3">
                                <Label 
                                    htmlFor="password_confirmation"
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white"
                                >
                                    Verifikasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="h-14 px-4 rounded-none bg-white dark:bg-black border-[2px] border-black dark:border-white focus:ring-0 focus:border-[#D80027] dark:focus:border-[#D80027] transition-none text-lg font-medium"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-16 w-full rounded-none bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xl hover:bg-[#D80027] dark:hover:bg-[#D80027] hover:text-white transition-none active:translate-x-1 active:translate-y-1"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? <Spinner className="size-6 border-white" /> : 'Konfirmasi Pendaftaran'}
                            </Button>
                        </div>

                        <div className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Sudah memiliki akun?{' '}
                            <TextLink 
                                href={login()} 
                                tabIndex={6}
                                className="text-black dark:text-white hover:text-[#D80027] transition-none underline underline-offset-4 decoration-2"
                            >
                                Masuk ke Sistem
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Akun Baru',
    description: 'Daftarkan identitas baru Anda untuk interaksi sistem',
};
