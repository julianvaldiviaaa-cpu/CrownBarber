import { Button } from '@heroui/react';
import { Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Mail,
    Phone,
    Plus,
    Scissors,
    ShieldCheck,
} from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import type { Paginated, User } from '@/types';

type Props = {
    workers: Paginated<User>;
    admins: Paginated<User>;
};

export default function Workers({ admins, workers }: Props) {
    return (
        <AppLayout navbar="dashboard">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <Button
                            onClick={() => router.get(route('dashboard'))}
                            className="mb-10 flex items-center justify-center gap-2 bg-black text-gray-300 transition-all duration-300 hover:gap-4"
                        >
                            <ChevronLeft /> Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
                            Trabajadores
                        </h1>
                        <p className="mt-2 text-base tracking-tight text-black/50">
                            Puedes administrar a todos los trabajadores desde
                            aquí
                        </p>
                    </div>

                    <Link
                        href={route('workers.create')}
                        className="group flex shrink-0 items-center gap-1.5 rounded-full bg-black px-5 py-3 text-sm font-semibold tracking-tight text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97]"
                    >
                        <Plus size={16} />
                        Nuevo empleado
                    </Link>
                </div>

                {/* Administradores */}
                <section className="mt-14">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-black/40" />
                        <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                            Administradores
                        </h2>
                        <span className="text-xs font-medium text-black/30">
                            ({admins.total})
                        </span>
                    </div>

                    {admins.data.length > 0 ? (
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {admins.data.map((admin) => (
                                <div
                                    onClick={() =>
                                        router.get(route('workers.show', admin))
                                    }
                                    key={admin.id}
                                    className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                                        {admin.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-black">
                                        {admin.name}
                                    </h3>
                                    <div className="flex flex-col gap-1.5 text-sm text-black/55">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <Mail
                                                size={13}
                                                className="shrink-0"
                                            />
                                            {admin.email}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone
                                                size={13}
                                                className="shrink-0"
                                            />
                                            +{admin.phone}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<ShieldCheck size={22} />}
                            text="Aún no hay administradores registrados"
                        />
                    )}
                </section>

                {/* Barberos */}
                <section className="mt-14">
                    <div className="flex items-center gap-2">
                        <Scissors size={18} className="text-black/40" />
                        <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                            Barberos
                        </h2>
                        <span className="text-xs font-medium text-black/30">
                            ({workers.total})
                        </span>
                    </div>

                    {workers.data.length > 0 ? (
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {workers.data.map((worker) => (
                                <div
                                    onClick={() =>
                                        router.get(
                                            route('workers.show', worker),
                                        )
                                    }
                                    key={worker.id}
                                    className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-black/70">
                                        {worker.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-black">
                                        {worker.name}
                                    </h3>
                                    <div className="flex flex-col gap-1.5 text-sm text-black/55">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <Mail
                                                size={13}
                                                className="shrink-0"
                                            />
                                            {worker.email}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone
                                                size={13}
                                                className="shrink-0"
                                            />
                                            +{worker.phone}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Scissors size={22} />}
                            text="Aún no hay barberos registrados"
                        />
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black/30">
                {icon}
            </div>
            <p className="text-sm font-medium text-black/45">{text}</p>
        </div>
    );
}
