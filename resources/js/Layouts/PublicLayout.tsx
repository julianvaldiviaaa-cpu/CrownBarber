import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Crown, Menu, X } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationRuntime from '@/Components/Notifications/NotificationRuntime';
import { home, login, dashboard } from '@/routes';
import { create } from '@/routes/appointments';
import { services, barbers, experience } from '@/routes/public';

export function BookingLink({
    children = 'Reservar cita',
    className = 'crown-button',
    query,
}: {
    children?: ReactNode;
    className?: string;
    query?: { service?: number; barber?: number };
}) {
    const { auth } = usePage().props;
    const isStaff = auth?.user && auth.user.role !== 'user';

    return (
        <Link
            href={isStaff ? dashboard() : create({ query })}
            className={className}
        >
            {isStaff ? 'Ir a mi panel' : children}
            <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
    );
}

const navigation = [
    { label: 'Inicio', route: home },
    { label: 'Servicios', route: services },
    { label: 'Barberos', route: barbers },
    { label: 'Cómo funciona', route: experience },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
    const {
        url,
        props: { auth },
    } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const site = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = site.current;
        let cancelled = false;
        let dispose: (() => void) | undefined;

        void import('@/lib/public-motion').then(({ createPublicMotion }) => {
            if (!cancelled && root) {
                dispose = createPublicMotion(root);
            }
        });

        return () => {
            cancelled = true;
            dispose?.();
        };
    }, [url]);

    return (
        <div ref={site} className="crown-site" lang="es">
            <div className="crown-scroll-progress" aria-hidden="true" />
            <a href="#contenido" className="crown-skip">
                Saltar al contenido
            </a>
            <header
                className="crown-header crown-container"
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setMenuOpen(false);
                        menuButton.current?.focus();
                    }
                }}
            >
                <Link
                    href={home()}
                    aria-label="Crown Barber, inicio"
                    className="crown-logo"
                >
                    <Crown strokeWidth={1.7} size={30} aria-hidden="true" />
                    <span>
                        CROWN<span className="crown-logo-sub">BARBER</span>
                    </span>
                </Link>
                <nav
                    aria-label="Navegación principal"
                    className="hidden items-center gap-8 lg:flex"
                >
                    {navigation.map(({ label, route }) => (
                        <Link
                            key={label}
                            href={route()}
                            prefetch
                            className="crown-nav-link"
                            aria-current={
                                url.split('?')[0] === route.url()
                                    ? 'page'
                                    : undefined
                            }
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-6">
                    <Link
                        href={auth?.user ? dashboard() : login()}
                        className="crown-nav-link hidden sm:block"
                    >
                        {auth?.user ? 'Mi cuenta' : 'Iniciar sesión'}
                    </Link>
                    <span className="hidden sm:block">
                        <BookingLink />
                    </span>
                    <button
                        ref={menuButton}
                        type="button"
                        className="crown-menu-button lg:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    >
                        {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {menuOpen && (
                    <nav
                        id="mobile-navigation"
                        data-lenis-prevent
                        aria-label="Navegación móvil"
                        className="crown-mobile-nav lg:hidden"
                    >
                        {navigation.map(({ label, route }) => (
                            <Link
                                key={label}
                                href={route()}
                                onClick={() => setMenuOpen(false)}
                                aria-current={
                                    url.split('?')[0] === route.url()
                                        ? 'page'
                                        : undefined
                                }
                            >
                                {label}
                                <ArrowUpRight size={18} />
                            </Link>
                        ))}
                        <Link href={auth?.user ? dashboard() : login()}>
                            {auth?.user ? 'Mi cuenta' : 'Iniciar sesión'}
                        </Link>
                        <BookingLink />
                    </nav>
                )}
            </header>
            <NotificationRuntime />
            <main id="contenido" tabIndex={-1} key={url}>
                {children}
            </main>
            <footer className="crown-footer">
                <div className="crown-container">
                    <div className="flex flex-col justify-between gap-8 border-b border-white/20 pb-12 md:flex-row md:items-end">
                        <div>
                            <p className="crown-eyebrow">
                                TU PRÓXIMO BUEN DÍA EMPIEZA AQUÍ
                            </p>
                            <h2 className="crown-display mt-5 text-5xl md:text-7xl">
                                Hazlo tuyo.
                            </h2>
                        </div>
                        <BookingLink className="crown-button crown-button-light" />
                    </div>
                    <div className="flex flex-col justify-between gap-8 py-9 text-sm md:flex-row">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-semibold"
                        >
                            <Crown size={22} /> CROWN BARBER
                        </Link>
                        <nav
                            aria-label="Navegación del pie de página"
                            className="flex flex-wrap gap-6"
                        >
                            {navigation.slice(1).map(({ label, route }) => (
                                <Link
                                    className="crown-footer-link"
                                    key={label}
                                    href={route()}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <span className="text-white/60">
                            Estilo propio. Siempre.
                        </span>
                    </div>
                    <div className="crown-footer-wordmark" aria-hidden="true">
                        CROWN BARBER
                    </div>
                </div>
            </footer>
        </div>
    );
}
