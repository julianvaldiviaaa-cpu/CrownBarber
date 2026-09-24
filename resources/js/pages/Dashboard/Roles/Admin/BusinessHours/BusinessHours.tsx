import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import ConfirmModal from '@/Components/ConfirmModal';
import AppLayout from '@/Layouts/AppLayout';
import { cn, parseDateOnly, toISODate } from '@/lib/utils';
import type { BusinessHour, BusinessHourOverride } from '@/types';

type WeekDay = { value: number; label: string };

type Props = {
    weekly: BusinessHour[];
    overrides: BusinessHourOverride[];
    weekDays: WeekDay[];
};

function DayRow({ day, hours }: { day: WeekDay; hours?: BusinessHour }) {
    const { data, setData, post, put, processing, errors } = useForm({
        day_of_week: day.value,
        open_time: hours?.open_time ?? '10:00',
        close_time: hours?.close_time ?? '20:00',
        active: hours?.active ?? false,
    });

    const isActive = data.active;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = { preserveScroll: true } as const;

        if (hours) {
            put(route('business-hours.update', hours), options);
        } else {
            post(route('business-hours.store'), options);
        }
    };

    return (
        <form
            onSubmit={submit}
            className={cn(
                'flex flex-col gap-4 rounded-2xl border p-5 transition-colors duration-200 sm:flex-row sm:items-center',
                isActive
                    ? 'border-black/20 bg-white'
                    : 'border-gray-200 bg-gray-50/50',
            )}
        >
            <div className="flex items-center gap-3 sm:w-40">
                <button
                    type="button"
                    onClick={() => setData('active', !isActive)}
                    title={isActive ? 'Día abierto' : 'Día cerrado'}
                    className={cn(
                        'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
                        isActive ? 'bg-black' : 'bg-gray-300',
                    )}
                >
                    <span
                        className={cn(
                            'h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                            isActive && 'translate-x-5',
                        )}
                    />
                </button>
                <span
                    className={cn(
                        'text-sm font-bold tracking-tight',
                        isActive ? 'text-black' : 'text-black/40',
                    )}
                >
                    {day.label}
                </span>
            </div>

            <div className="flex flex-1 items-center gap-2">
                <input
                    type="time"
                    value={data.open_time}
                    onChange={(e) => setData('open_time', e.target.value)}
                    disabled={!isActive}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black transition-colors outline-none focus:border-black disabled:opacity-40 sm:max-w-[130px]"
                />
                <span className="text-black/30">—</span>
                <input
                    type="time"
                    value={data.close_time}
                    onChange={(e) => setData('close_time', e.target.value)}
                    disabled={!isActive}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black transition-colors outline-none focus:border-black disabled:opacity-40 sm:max-w-[130px]"
                />
            </div>

            <button
                type="submit"
                disabled={processing}
                className="flex items-center justify-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:opacity-50"
            >
                {processing ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Clock size={14} />
                )}
                Guardar
            </button>

            {errors.day_of_week && (
                <p className="text-sm font-medium text-red-600">
                    {errors.day_of_week}
                </p>
            )}
        </form>
    );
}

function OverrideForm({ onDone }: { onDone: () => void }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        date: '',
        open_time: '10:00',
        close_time: '20:00',
        is_closed: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('business-hours.overrides.store'), {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-5"
        >
            <p className="text-sm font-semibold tracking-tight text-black">
                Nueva excepción por fecha
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                        Fecha
                    </span>
                    <input
                        type="date"
                        min={toISODate(new Date())}
                        value={data.date}
                        onChange={(e) => {
                            setData('date', e.target.value);

                            if (errors.date) {
                                clearErrors('date');
                            }
                        }}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black outline-none focus:border-black"
                    />
                </label>
                <div className="flex items-end gap-2">
                    <label className="flex flex-1 flex-col gap-1">
                        <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                            Apertura
                        </span>
                        <input
                            type="time"
                            value={data.open_time}
                            onChange={(e) =>
                                setData('open_time', e.target.value)
                            }
                            disabled={data.is_closed}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black outline-none focus:border-black disabled:opacity-40"
                        />
                    </label>
                    <span className="pb-2 text-black/30">—</span>
                    <label className="flex flex-1 flex-col gap-1">
                        <span className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                            Cierre
                        </span>
                        <input
                            type="time"
                            value={data.close_time}
                            onChange={(e) =>
                                setData('close_time', e.target.value)
                            }
                            disabled={data.is_closed}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-black outline-none focus:border-black disabled:opacity-40"
                        />
                    </label>
                </div>
                <label className="flex items-center gap-2 sm:col-span-2">
                    <button
                        type="button"
                        onClick={() => setData('is_closed', !data.is_closed)}
                        className={cn(
                            'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
                            data.is_closed ? 'bg-red-500' : 'bg-gray-300',
                        )}
                    >
                        <span
                            className={cn(
                                'h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                                data.is_closed && 'translate-x-5',
                            )}
                        />
                    </button>
                    <span className="text-sm font-medium text-black/60">
                        Cerrado todo el día
                    </span>
                </label>
            </div>
            {errors.date && (
                <p className="text-sm font-medium text-red-600">
                    {errors.date}
                </p>
            )}
            <button
                type="submit"
                disabled={processing}
                className="flex items-center justify-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:opacity-50"
            >
                {processing ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Plus size={14} />
                )}
                Agregar excepción
            </button>
        </form>
    );
}

function OverrideRow({ override }: { override: BusinessHourOverride }) {
    const dateLabel = parseDateOnly(override.date).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-bold tracking-tight text-black capitalize">
                    {dateLabel}
                </p>
                <p className="text-sm text-black/50">
                    {override.is_closed ? (
                        <span className="font-semibold text-red-600">
                            Cerrado todo el día
                        </span>
                    ) : (
                        <>
                            Abierto de{' '}
                            <strong className="text-black">
                                {override.open_time}
                            </strong>{' '}
                            a{' '}
                            <strong className="text-black">
                                {override.close_time}
                            </strong>
                        </>
                    )}
                </p>
            </div>

            <ConfirmModal
                heading={`¿Eliminar la excepción del ${dateLabel}?`}
                message="Ese día volverá a usar el horario semanal."
                confirmLabel="Sí, eliminar"
                onConfirm={() =>
                    router.delete(
                        route('business-hours.overrides.destroy', override),
                        { preserveScroll: true },
                    )
                }
                triggerClassName="flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold tracking-tight text-red-600 transition-colors hover:bg-red-50"
                triggerChildren={
                    <>
                        <Trash2 size={14} />
                        Eliminar
                    </>
                }
            />
        </div>
    );
}

export default function BusinessHours({ weekly, overrides, weekDays }: Props) {
    const [showOverrideForm, setShowOverrideForm] = useState(false);

    return (
        <AppLayout navbar="dashboard">
            <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
                <button
                    type="button"
                    onClick={() => router.get(route('dashboard'))}
                    className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.15em] text-black/40 uppercase transition-colors duration-150 hover:text-black"
                >
                    <ArrowLeft size={12} />
                    Dashboard
                </button>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight text-black">
                            Horarios de apertura
                        </h1>
                        <p className="mt-2 text-sm font-medium tracking-tight text-black/40">
                            Los clientes solo podrán agendar dentro de estos
                            horarios.
                        </p>
                    </div>
                </div>

                {/* Horario semanal */}
                <section className="mt-10">
                    <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                        Horario semanal
                    </h2>
                    <div className="mt-4 flex flex-col gap-3">
                        {weekDays.map((day) => (
                            <DayRow
                                key={day.value}
                                day={day}
                                hours={weekly.find(
                                    (h) => h.day_of_week === day.value,
                                )}
                            />
                        ))}
                    </div>
                </section>

                {/* Excepciones */}
                <section className="mt-14">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                                Excepciones por fecha
                            </h2>
                            <p className="mt-1 text-sm text-black/45">
                                Cierres, festivos u horarios especiales para
                                días concretos.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowOverrideForm((v) => !v)}
                            className="flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97]"
                        >
                            {showOverrideForm ? (
                                <X size={14} />
                            ) : (
                                <Plus size={14} />
                            )}
                            {showOverrideForm ? 'Cancelar' : 'Nueva excepción'}
                        </button>
                    </div>

                    {showOverrideForm && (
                        <div className="mt-4">
                            <OverrideForm
                                onDone={() => setShowOverrideForm(false)}
                            />
                        </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3">
                        {overrides.length === 0 && (
                            <p className="text-sm text-black/40">
                                No hay excepciones registradas.
                            </p>
                        )}
                        {overrides.map((override) => (
                            <OverrideRow
                                key={override.id}
                                override={override}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
