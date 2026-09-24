import { Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUpRight,
    Clock,
    Crown,
    Plus,
    Scissors,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { BookingLink } from '@/Layouts/PublicLayout';
import {
    services as servicesRoute,
    barbers as barbersRoute,
} from '@/routes/public';

export type PublicService = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    slug: string;
};
export type PublicBarber = { id: number; name: string };

export function Reveal({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={`crown-reveal ${className}`}>{children}</div>;
}

export function PageIntro({
    number,
    label,
    title,
    description,
}: {
    number: string;
    label: string;
    title: ReactNode;
    description: string;
}) {
    return (
        <section className="crown-container crown-page-intro">
            <p className="crown-eyebrow">
                <span className="crown-accent">{number} /</span> {label}
            </p>
            <h1 className="crown-display">{title}</h1>
            <div className="flex items-end justify-between gap-8">
                <p className="crown-copy max-w-xl">{description}</p>
                <ArrowDown
                    className="hidden sm:block"
                    size={30}
                    aria-hidden="true"
                />
            </div>
        </section>
    );
}

export function ServiceList({
    services,
    preview = false,
}: {
    services: PublicService[];
    preview?: boolean;
}) {
    return (
        <section className="crown-container crown-section">
            {preview && (
                <div className="crown-section-heading">
                    <div>
                        <p className="crown-eyebrow">
                            01 / EL ARTE DEL DETALLE
                        </p>
                        <h2 className="crown-display">A tu medida.</h2>
                    </div>
                    <Link href={servicesRoute()} className="crown-text-link">
                        Todos los servicios <ArrowUpRight size={18} />
                    </Link>
                </div>
            )}
            {services.length === 0 ? (
                <div className="crown-empty">
                    <Scissors size={32} />
                    <h2>Estamos preparando el catálogo.</h2>
                    <p>
                        Muy pronto podrás consultar aquí nuestros servicios y
                        precios.
                    </p>
                </div>
            ) : (
                <div className="crown-service-list">
                    {services.map((service, index) => (
                        <Reveal key={service.id}>
                            <article className="crown-service-row">
                                <span className="crown-service-number">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                    <h3>{service.name}</h3>
                                    <p>
                                        {service.description ||
                                            'Un servicio pensado para darle personalidad a tu estilo.'}
                                    </p>
                                </div>
                                <span className="crown-duration">
                                    <Clock size={14} aria-hidden="true" />
                                    {service.duration} min
                                </span>
                                <span className="crown-price">
                                    {new Intl.NumberFormat('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN',
                                        maximumFractionDigits: 2,
                                    }).format(Number(service.price))}
                                    <small>MXN</small>
                                </span>
                                <BookingLink
                                    query={{ service: service.id }}
                                    className="crown-service-book"
                                >
                                    <span className="sr-only">
                                        Reservar {service.name}
                                    </span>
                                </BookingLink>
                            </article>
                        </Reveal>
                    ))}
                </div>
            )}
            <p className="mt-6 text-xs text-[#726c63]">
                Precios en pesos mexicanos. La duración indicada es aproximada.
            </p>
        </section>
    );
}

export function BarberList({
    barbers,
    preview = false,
}: {
    barbers: PublicBarber[];
    preview?: boolean;
}) {
    return (
        <section className="crown-container crown-section">
            {preview && (
                <div className="crown-section-heading">
                    <div>
                        <p className="crown-eyebrow">03 / EL EQUIPO CROWN</p>
                        <h2 className="crown-display">
                            Buenas manos.
                            <br />
                            Mejor estilo.
                        </h2>
                    </div>
                    <Link href={barbersRoute()} className="crown-text-link">
                        Conoce al equipo <ArrowUpRight size={18} />
                    </Link>
                </div>
            )}
            {barbers.length === 0 ? (
                <div className="crown-empty">
                    <Crown size={32} />
                    <h2>El equipo está por llegar.</h2>
                    <p>
                        Los barberos disponibles aparecerán aquí cuando se
                        incorporen.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {barbers.map((barber, index) => (
                        <Reveal key={barber.id}>
                            <article
                                className={`crown-barber crown-barber-${index % 4}`}
                            >
                                <div
                                    className="crown-barber-art"
                                    aria-hidden="true"
                                >
                                    <span className="crown-eyebrow">
                                        CROWN /{' '}
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <Crown
                                        className="crown-barber-crown"
                                        strokeWidth={0.6}
                                    />
                                    <span className="crown-barber-initial">
                                        {barber.name
                                            .trim()
                                            .split(/\s+/)
                                            .slice(0, 2)
                                            .map((word) => word[0])
                                            .join('')}
                                    </span>
                                    <span className="crown-eyebrow">
                                        EL OFICIO. EL DETALLE.
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 py-5">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold wrap-break-word">
                                            {barber.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-[#726c63]">
                                            Barbero · Crown Barber
                                        </p>
                                    </div>
                                    <BookingLink
                                        query={{ barber: barber.id }}
                                        className="crown-round-link"
                                    >
                                        <span className="sr-only">
                                            Reservar con {barber.name}
                                        </span>
                                    </BookingLink>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            )}
        </section>
    );
}

export const steps = [
    {
        number: '01',
        title: 'Encuentra tu estilo.',
        copy: 'Explora los servicios y elige lo que necesitas. Verás el precio y la duración antes de reservar.',
    },
    {
        number: '02',
        title: 'Elige tu momento.',
        copy: 'Crea tu cuenta, verifica tu correo y selecciona tu barbero, el día y una hora disponible.',
    },
    {
        number: '03',
        title: 'Nos vemos en la silla.',
        copy: 'Tu barbero revisará la solicitud. Consulta en tu cuenta la confirmación o una propuesta de horario.',
    },
];

export function Steps() {
    return (
        <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
                <Reveal key={step.number}>
                    <div className="crown-step">
                        <span>{step.number}</span>
                        <h3>{step.title}</h3>
                        <p>{step.copy}</p>
                    </div>
                </Reveal>
            ))}
        </div>
    );
}

export function Faq() {
    const questions = [
        [
            '¿Necesito una cuenta para reservar?',
            'Sí. Crea tu cuenta y verifica tu correo electrónico para solicitar una cita. Desde ahí podrás consultar tus reservas y las respuestas de tu barbero.',
        ],
        [
            '¿Mi cita se confirma al reservar?',
            'Tu solicitud queda pendiente hasta que el barbero la confirme. Si propone otra hora, podrás aceptarla o responder desde el detalle de tu cita.',
        ],
        [
            '¿Puedo elegir a mi barbero?',
            'Sí. Al reservar puedes seleccionar cualquiera de los barberos disponibles y consultar sus horarios libres para los servicios que elegiste.',
        ],
        [
            '¿Puedo cambiar o cancelar mi cita?',
            'Puedes proponer otra hora o cancelar una cita futura desde tu cuenta, según su estado. Revisa los botones disponibles en el detalle de la reserva.',
        ],
        [
            '¿Puedo reservar varios servicios?',
            'Sí. Puedes combinar servicios en una misma cita. El sistema suma sus precios y duración para mostrarte los horarios disponibles.',
        ],
    ];

    return (
        <section className="crown-container crown-section grid gap-12 lg:grid-cols-2">
            <div>
                <p className="crown-eyebrow">SIN COMPLICACIONES</p>
                <h2 className="crown-display mt-5 text-5xl">Antes de venir.</h2>
                <p className="crown-copy mt-6 max-w-sm">
                    Todo lo que necesitas saber para disfrutar tu próxima
                    visita.
                </p>
            </div>
            <div>
                {questions.map(([question, answer]) => (
                    <details className="crown-faq" key={question}>
                        <summary>
                            {question}
                            <Plus size={20} aria-hidden="true" />
                        </summary>
                        <p>{answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
