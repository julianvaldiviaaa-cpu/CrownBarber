import { Avatar, Button, Dropdown } from '@heroui/react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    CalendarDays,
    LogIn,
    LogOut,
    Menu,
    Plus,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { route } from 'ziggy-js';
import NotificationsBell from '@/Components/Notifications/NotificationsBell';
import { home } from '@/routes';
import { create as createAppointment } from '@/routes/appointments';
import {
    services as publicServices,
    barbers,
    experience,
} from '@/routes/public';

type Props = {
    navbar: 'dashboard' | 'guest';
};

const guestLinks = [
    { label: 'Inicio', href: home.url() },
    { label: 'Servicios', href: publicServices.url() },
    { label: 'Barberos', href: barbers.url() },
    { label: 'Cómo funciona', href: experience.url() },
];

export default function Navbar({ navbar }: Props) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const InitialLetterName = user?.name?.charAt(0).toUpperCase();

    const [mobileOpen, setMobileOpen] = useState(false);

    // Cierra el menú mobile con Escape y al cambiar a desktop.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setMobileOpen(false);
            }
        }
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <nav className="relative z-50">
            <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
                <Link
                    href={route('home')}
                    className="text-xl font-bold tracking-tight text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                    onClick={() => setMobileOpen(false)}
                >
                    Crown Barber {user?.role === 'worker' && '- Trabajador'}{' '}
                    {user?.role === 'admin' && '- Administrador'}
                </Link>

                {/* Links de escritorio */}
                {navbar === 'guest' && (
                    <div className="hidden items-center gap-8 md:flex">
                        {guestLinks.map((link) => (
                            <NavLink key={link.label} href={link.href}>
                                {link.label}
                            </NavLink>
                        ))}
                        <Link
                            href={createAppointment()}
                            className="group relative overflow-hidden border-2 border-black px-5 py-2 text-sm font-semibold tracking-tight text-black transition-transform duration-150 active:scale-[0.97]"
                        >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                                Agendar Cita
                            </span>
                            <div className="absolute inset-0 origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    </div>
                )}

                {/* Auth de escritorio */}
                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <>
                            {user?.role === 'admin' && (
                                <>
                                    {' '}
                                    <Button
                                        onClick={() =>
                                            router.get(route('workers.create'))
                                        }
                                        className="bg-black px-6 text-gray-300"
                                    >
                                        <UserRound />
                                        Nuevo Empleado
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            router.get(route('services.create'))
                                        }
                                        className="bg-black px-6 text-gray-300"
                                    >
                                        <Briefcase />
                                        Nuevo Servicio
                                    </Button>
                                </>
                            )}
                            {user?.role === 'user' && (
                                <Button
                                    onClick={() =>
                                        router.get(route('appointments.create'))
                                    }
                                    className="bg-black px-6 text-gray-300"
                                >
                                    <Plus /> Nueva Cita
                                </Button>
                            )}
                            <NotificationsBell />
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Avatar>
                                        <Avatar.Fallback className="text-xl font-bold">
                                            {InitialLetterName}
                                        </Avatar.Fallback>
                                    </Avatar>
                                </Dropdown.Trigger>
                                <Dropdown.Popover>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className="flex items-center">
                                            <UserRound size={20} />
                                            <p className="text-lg tracking-tighter">
                                                {user?.name}
                                            </p>
                                        </Dropdown.Item>
                                        {user?.role === 'user' && (
                                            <Dropdown.Item
                                                onClick={() =>
                                                    router.get(
                                                        route(
                                                            'appointments.create',
                                                        ),
                                                    )
                                                }
                                                className="flex items-center"
                                            >
                                                <Plus size={20} />
                                                <p className="text-lg tracking-tighter">
                                                    Nueva Cita
                                                </p>
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item
                                            onClick={() =>
                                                router.get(route('profile'))
                                            }
                                            className="flex items-center"
                                        >
                                            <UserRound size={20} />
                                            <p className="text-lg tracking-tighter">
                                                Mi Cuenta
                                            </p>
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() =>
                                                router.get(
                                                    route('appointments'),
                                                )
                                            }
                                            className="flex items-center"
                                        >
                                            <CalendarDays size={20} />
                                            <p className="text-lg tracking-tighter">
                                                Mis Citas
                                            </p>
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() =>
                                                router.post(route('logout'))
                                            }
                                            className="flex items-center text-red-500"
                                        >
                                            <LogOut size={20} />
                                            <p className="text-lg tracking-tighter">
                                                Cerrar Sesion
                                            </p>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold tracking-tight text-black/70 transition-colors duration-150 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black active:scale-[0.97]"
                            >
                                <LogIn size={16} />
                                Iniciar Sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="group relative flex items-center gap-1.5 bg-black px-4 py-2 text-sm font-semibold tracking-tight text-white transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black active:scale-[0.97]"
                            >
                                Crear Cuenta
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                                />
                            </Link>
                        </>
                    )}
                </div>

                {/* Botón hamburguesa (mobile) */}
                {user && (
                    <div className="ml-auto md:hidden">
                        <NotificationsBell />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setMobileOpen((v) => !v)}
                    className="flex items-center justify-center p-2 text-black transition-transform duration-150 active:scale-90 md:hidden"
                    aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Panel mobile */}
            {mobileOpen && (
                <div className="flex flex-col gap-1 border-t border-black/10 bg-white px-6 py-4 md:hidden">
                    {navbar === 'guest' &&
                        guestLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="py-3 text-base font-medium tracking-tight text-black active:opacity-60"
                            >
                                {link.label}
                            </Link>
                        ))}

                    {navbar === 'guest' && (
                        <Link
                            href={route('appointments.create')}
                            onClick={() => setMobileOpen(false)}
                            className="mt-2 border-2 border-black px-5 py-3 text-center text-base font-semibold tracking-tight text-black active:scale-[0.97]"
                        >
                            Agendar Cita
                        </Link>
                    )}

                    <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                onClick={() => setMobileOpen(false)}
                                className="py-2 text-base font-semibold tracking-tight text-black"
                            >
                                Mi Cuenta
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 py-2 text-base font-semibold tracking-tight text-black/70 active:opacity-60"
                                >
                                    <LogIn size={18} />
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 bg-black px-4 py-3 text-base font-semibold tracking-tight text-white active:scale-[0.97]"
                                >
                                    Crear Cuenta
                                    <ArrowRight size={18} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="group relative text-base font-bold tracking-tight text-black/70 transition-colors duration-150 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
            {children}
            <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
        </Link>
    );
}
