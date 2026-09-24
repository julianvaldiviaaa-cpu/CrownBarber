import { Head } from '@inertiajs/react';
import { Faq, PageIntro, Steps } from '@/Components/PublicSections';
import PublicLayout, { BookingLink } from '@/Layouts/PublicLayout';
import type { BusinessHour } from '@/types';

const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
];

export default function Experience({ hours }: { hours: BusinessHour[] }) {
    return (
        <PublicLayout>
            <Head title="Cómo funciona · Crown Barber">
                <meta
                    name="description"
                    content="Reserva en Crown Barber en tres pasos. Conoce nuestros horarios y resuelve tus dudas sobre citas, cambios y confirmaciones."
                />
            </Head>
            <PageIntro
                number="03"
                label="LA EXPERIENCIA CROWN"
                title={
                    <>
                        Menos vueltas.
                        <br />
                        <span className="crown-accent">Más estilo.</span>
                    </>
                }
                description="Tu tiempo cuenta. Elige tu servicio, encuentra una hora y deja que nosotros nos ocupemos de los detalles."
            />
            <section className="crown-container crown-section">
                <Steps />
                <div className="mt-12">
                    <BookingLink />
                </div>
            </section>
            <section className="crown-hours">
                <div className="crown-container grid gap-12 lg:grid-cols-2">
                    <div>
                        <p className="crown-eyebrow">
                            HAZLE UN ESPACIO A TU ESTILO
                        </p>
                        <h2 className="crown-display mt-6">
                            Encuentra
                            <br />
                            tu momento.
                        </h2>
                        <p className="crown-copy mt-6 max-w-md">
                            Estos son nuestros horarios habituales. Al reservar
                            verás la disponibilidad de tu barbero y los cambios
                            de horario para fechas especiales.
                        </p>
                    </div>
                    <div>
                        {hours.length === 0 ? (
                            <p className="crown-copy">
                                Estamos preparando nuestros horarios. Vuelve
                                pronto para consultar la disponibilidad.
                            </p>
                        ) : (
                            days.map((day, index) => {
                                const hour = hours.find(
                                    (entry) => entry.day_of_week === index,
                                );

                                return (
                                    <div className="crown-hour-row" key={day}>
                                        <span>{day}</span>
                                        <span>
                                            {hour?.active
                                                ? `${hour.open_time.slice(0, 5)} — ${hour.close_time.slice(0, 5)}`
                                                : 'Cerrado'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>
            <Faq />
        </PublicLayout>
    );
}
