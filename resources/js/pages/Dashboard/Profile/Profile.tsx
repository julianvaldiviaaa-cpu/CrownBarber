import { router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    Loader2,
    Lock,
    Save,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { route } from 'ziggy-js';
import NotificationSettings from '@/Components/Notifications/NotificationSettings';
import AppLayout from '@/Layouts/AppLayout';
import type { User } from '@/types/auth';

type Props = {
    user: User;
};

const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black outline-none transition-colors focus:border-black';

export default function Profile({ user }: Props) {
    const info = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
    });

    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        info.put(route('profile.update'));
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        password.put(route('profile.password'), {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };

    return (
        <AppLayout navbar="dashboard">
            <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
                <button
                    type="button"
                    onClick={() => router.get(route('dashboard'))}
                    className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.15em] text-black/40 uppercase transition-colors duration-150 hover:text-black"
                >
                    <ArrowLeft size={12} />
                    Dashboard
                </button>

                <div className="mt-6">
                    <h1 className="text-5xl font-bold tracking-tight text-black">
                        Mi cuenta
                    </h1>
                    <p className="mt-2 text-sm font-medium tracking-tight text-black/40">
                        Administra tus datos personales y tu contraseña.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold">
                            Notificaciones
                        </h2>
                        <NotificationSettings />
                    </section>
                    {/* Información de la cuenta */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                <UserRound size={18} />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-black">
                                    Información de la cuenta
                                </h2>
                                <p className="text-sm text-black/45">
                                    Nombre, correo y teléfono.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submitInfo}
                            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <Field label="Nombre" error={info.errors.name}>
                                <input
                                    type="text"
                                    value={info.data.name}
                                    onChange={(e) =>
                                        info.setData('name', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Tu nombre"
                                />
                            </Field>

                            <Field label="Teléfono" error={info.errors.phone}>
                                <input
                                    type="tel"
                                    value={info.data.phone}
                                    onChange={(e) =>
                                        info.setData('phone', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="+52 ..."
                                />
                            </Field>

                            <Field
                                label="Correo electrónico"
                                error={info.errors.email}
                            >
                                <input
                                    type="email"
                                    value={info.data.email}
                                    onChange={(e) =>
                                        info.setData('email', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="correo@ejemplo.com"
                                />
                            </Field>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={info.processing}
                                    className="flex items-center justify-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {info.processing ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={15} />
                                    )}
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Cambio de contraseña */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-black/70">
                                <KeyRound size={18} />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-black">
                                    Cambiar contraseña
                                </h2>
                                <p className="text-sm text-black/45">
                                    La contraseña solo puede cambiarse desde
                                    aquí.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submitPassword}
                            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <Field
                                label="Contraseña actual"
                                error={password.errors.current_password}
                            >
                                <div className="relative">
                                    <Lock
                                        size={15}
                                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-black/30"
                                    />
                                    <input
                                        type="password"
                                        value={password.data.current_password}
                                        onChange={(e) =>
                                            password.setData(
                                                'current_password',
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} pl-9`}
                                        placeholder="Tu contraseña actual"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </Field>

                            <Field
                                label="Nueva contraseña"
                                error={password.errors.password}
                            >
                                <div className="relative">
                                    <Lock
                                        size={15}
                                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-black/30"
                                    />
                                    <input
                                        type="password"
                                        value={password.data.password}
                                        onChange={(e) =>
                                            password.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} pl-9`}
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </Field>

                            <Field
                                label="Repetir nueva contraseña"
                                error={password.errors.password_confirmation}
                            >
                                <div className="relative">
                                    <Lock
                                        size={15}
                                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-black/30"
                                    />
                                    <input
                                        type="password"
                                        value={
                                            password.data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            password.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} pl-9`}
                                        placeholder="Repite la nueva contraseña"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </Field>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={
                                        password.processing ||
                                        !password.data.password ||
                                        !password.data.current_password
                                    }
                                    className="flex items-center justify-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {password.processing ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <KeyRound size={15} />
                                    )}
                                    Actualizar contraseña
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                {label}
            </span>
            {children}
            {error && (
                <span className="text-xs font-medium text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}
