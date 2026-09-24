import { Head } from '@inertiajs/react';
import { BarberList, PageIntro } from '@/Components/PublicSections';
import type { PublicBarber } from '@/Components/PublicSections';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Barbers({ barbers }: { barbers: PublicBarber[] }) {
    return (
        <PublicLayout>
            <Head title="Barberos · Crown Barber">
                <meta
                    name="description"
                    content="Conoce al equipo de Crown Barber y elige al barbero de tu próxima cita."
                />
            </Head>
            <PageIntro
                number="02"
                label="EL EQUIPO CROWN"
                title={
                    <>
                        El oficio en
                        <br />
                        <span className="crown-accent">buenas manos.</span>
                    </>
                }
                description="Detrás de cada corte hay alguien que escucha, observa y cuida los detalles. Conoce al equipo y elige con quién va tu estilo."
            />
            <BarberList barbers={barbers} />
            <section className="crown-container crown-section border-t border-black/15">
                <p className="crown-eyebrow">
                    UNA CONVERSACIÓN ANTES DE EMPEZAR
                </p>
                <p className="crown-display mt-6 max-w-4xl text-4xl md:text-6xl">
                    Trae una idea.
                    <br />
                    Démosle tu personalidad.
                </p>
                <p className="crown-copy mt-6 max-w-lg">
                    Un estilo de referencia, tu rutina o simplemente lo que te
                    gustaría cambiar. Cuéntaselo a tu barbero cuando llegues.
                </p>
            </section>
        </PublicLayout>
    );
}
