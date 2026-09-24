import { Button } from '@heroui/react';
import { router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Scissors,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import FormLayout from '@/Layouts/FormLayout';
import { cn, formatMoney, formatSlotTime, toISODate } from '@/lib/utils';
import { dashboard } from '@/routes';
import { availability, store } from '@/routes/appointments';
import type { BusinessHoursPayload, Service, User } from '@/types';

type Props = {
    services: Service[];
    workers: User[];
    businessHours: BusinessHoursPayload;
    selection: { service: number | null; barber: number | null };
};

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_LABELS = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
];

/** ¿Está abierta la barbería en esta fecha? Respeta overrides y horario semanal. */
function isDateOpen(date: Date, businessHours: BusinessHoursPayload): boolean {
    const iso = toISODate(date);
    const override = businessHours.overrides.find((o) => o.date === iso);

    if (override) {
        return !override.is_closed;
    }

    const weekly = businessHours.weekly.find(
        (h) => h.day_of_week === (date.getDay() + 6) % 7,
    );

    return Boolean(weekly?.active);
}

export default function AppointmentCreate({
    services,
    workers,
    businessHours,
    selection,
}: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [workerError, setWorkerError] = useState<string | null>(null);

    const { data, setData, errors, clearErrors, post, processing } = useForm({
        services: selection.service ? [selection.service] : ([] as number[]),
        date: '',
        time: '',
        worker_id: (selection.barber ?? '') as number | string,
    });

    const selectedServices = useMemo(
        () => services.filter((service) => data.services.includes(service.id)),
        [data.services, services],
    );

    const totalDuration = useMemo(
        () =>
            selectedServices.reduce(
                (sum, service) => sum + service.duration,
                0,
            ),
        [selectedServices],
    );

    const totalPrice = useMemo(
        () =>
            selectedServices.reduce(
                (sum, service) => sum + Number(service.price),
                0,
            ),
        [selectedServices],
    );

    // Próximos 60 días: guardamos los primeros 14 que estén abiertos.
    const openDays = useMemo(() => {
        const days: Date[] = [];
        const cursor = new Date();

        for (let offset = 1; offset <= 60 && days.length < 14; offset++) {
            const candidate = new Date(cursor);
            candidate.setDate(cursor.getDate() + offset);

            if (isDateOpen(candidate, businessHours)) {
                days.push(candidate);
            }
        }

        return days;
    }, [businessHours]);

    const toggleService = (service: Service) => {
        const isSelected = data.services.includes(service.id);
        setData(
            'services',
            isSelected
                ? data.services.filter((id) => id !== service.id)
                : [...data.services, service.id],
        );

        if (errors.services) {
            clearErrors('services');
        }
    };

    const pickDate = (date: Date) => {
        const iso = toISODate(date);
        setSelectedDate(date);
        setData('date', iso);
        setData('time', '');
        setSlots([]);
        setWorkerError(null);

        if (errors.date) {
            clearErrors('date');
        }

        loadSlots(iso);
    };

    const pickWorker = (workerId: number | string) => {
        setData('worker_id', workerId);

        if (errors.worker_id) {
            clearErrors('worker_id');
        }

        if (selectedDate) {
            verifyWorkerSlot(toISODate(selectedDate), workerId);
        }
    };

    const verifyWorkerSlot = async (
        dateIso: string,
        workerId: number | string,
    ) => {
        setLoadingSlots(true);

        try {
            const response = await fetch(
                availability.url({
                    query: {
                        date: dateIso,
                        worker_id: workerId,
                        services: data.services,
                    },
                }),
            );
            const payload = await response.json();
            const workerSlots: string[] = payload.slots ?? [];

            if (data.time && !workerSlots.includes(data.time)) {
                setData('time', '');
                setWorkerError(
                    `La hora ${formatSlotTime(data.time)} no está disponible para este barbero. Elige otra hora en el paso anterior.`,
                );
            } else {
                setWorkerError(null);
            }
        } catch {
            setWorkerError(
                'No se pudo verificar la disponibilidad del barbero.',
            );
        } finally {
            setLoadingSlots(false);
        }
    };

    const loadSlots = async (dateIso: string, workerId?: number | string) => {
        if (data.services.length === 0) {
            return;
        }

        setLoadingSlots(true);

        try {
            const params: {
                date: string;
                services: number[];
                worker_id?: number | string;
            } = {
                date: dateIso,
                services: data.services,
            };

            const id = workerId ?? data.worker_id;

            if (id) {
                params.worker_id = id;
            }

            const response = await fetch(availability.url({ query: params }));
            const payload = await response.json();
            setSlots(payload.slots ?? []);
        } catch {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const canNextFrom1 = data.services.length > 0;
    const canSubmit = selectedDate && data.time && data.worker_id;

    return (
        <FormLayout navbar="dashboard">
            <Button
                onClick={() => router.get(dashboard.url())}
                className="mb-10 flex items-center justify-center gap-2 bg-black text-gray-300 transition-all duration-300 hover:gap-4"
            >
                <ChevronLeft /> Dashboard
            </Button>

            <div className="mx-auto w-full max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
                    Agendar cita
                </h1>
                <p className="mt-2 text-sm font-medium tracking-tight text-black/40">
                    Paso {step} de 3 · {selectedServices.length}{' '}
                    {selectedServices.length === 1 ? 'servicio' : 'servicios'} ·{' '}
                    {formatMoney(totalPrice)} · {totalDuration} min
                </p>

                {/* Indicador de pasos */}
                <div className="mt-8 flex items-center gap-2">
                    {(['Servicios', 'Día y hora', 'Barbero'] as const).map(
                        (label, index) => {
                            const stepNumber = (index + 1) as 1 | 2 | 3;
                            const isActive = step === stepNumber;
                            const isDone = step > stepNumber;

                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        if (stepNumber < step) {
                                            setStep(stepNumber);
                                        }
                                    }}
                                    disabled={
                                        stepNumber > step &&
                                        !(stepNumber === 2 && canNextFrom1)
                                    }
                                    className={cn(
                                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-colors',
                                        isActive && 'bg-black text-white',
                                        isDone &&
                                            'bg-gray-100 text-black/60 hover:bg-gray-200',
                                        !isActive &&
                                            !isDone &&
                                            'bg-gray-100 text-black/35',
                                    )}
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                                        {stepNumber}
                                    </span>
                                    {label}
                                </button>
                            );
                        },
                    )}
                </div>

                <form onSubmit={submit} className="mt-10">
                    {/* Paso 1: servicios */}
                    {step === 1 && (
                        <div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {services.map((service) => {
                                    const selected = data.services.includes(
                                        service.id,
                                    );

                                    return (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() =>
                                                toggleService(service)
                                            }
                                            className={cn(
                                                'flex flex-col gap-3 rounded-2xl border bg-white p-5 text-left transition-all duration-200',
                                                selected
                                                    ? 'border-black shadow-md'
                                                    : 'border-gray-200 hover:border-black/40',
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black/70">
                                                    <Scissors size={16} />
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex h-5 w-5 items-center justify-center rounded-full border text-xs text-white',
                                                        selected
                                                            ? 'border-black bg-black'
                                                            : 'border-gray-300 bg-white text-transparent',
                                                    )}
                                                >
                                                    ✓
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold tracking-tight text-black">
                                                    {service.name}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 text-sm text-black/45">
                                                    {service.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-1 text-black/50">
                                                    <Clock size={13} />
                                                    {service.duration} min
                                                </span>
                                                <span className="font-extrabold tracking-tight text-black">
                                                    {formatMoney(service.price)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.services && (
                                <p className="mt-4 text-sm font-medium text-red-600">
                                    {errors.services}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Paso 2: día y hora */}
                    {step === 2 && (
                        <div className="flex flex-col gap-8">
                            <div>
                                <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                                    Elige el día
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {openDays.map((date) => {
                                        const selected =
                                            selectedDate?.toDateString() ===
                                            date.toDateString();

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                type="button"
                                                onClick={() => pickDate(date)}
                                                className={cn(
                                                    'flex w-16 flex-col items-center rounded-2xl border px-3 py-3 transition-all duration-150',
                                                    selected
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 bg-white text-black hover:border-black',
                                                )}
                                            >
                                                <span className="text-[11px] font-medium opacity-60">
                                                    {DAY_LABELS[date.getDay()]}
                                                </span>
                                                <span className="text-lg font-extrabold tracking-tight">
                                                    {date.getDate()}
                                                </span>
                                                <span className="text-[11px] font-medium opacity-60">
                                                    {
                                                        MONTH_LABELS[
                                                            date.getMonth()
                                                        ]
                                                    }
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.date && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {errors.date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h2 className="flex items-center gap-2 text-xs font-semibold tracking-widest text-black/40 uppercase">
                                    <Clock size={13} />
                                    Hora disponible
                                </h2>

                                {loadingSlots ? (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-black/50">
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Consultando disponibilidad…
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => {
                                                    setData('time', slot);

                                                    if (errors.time) {
                                                        clearErrors('time');
                                                    }
                                                }}
                                                className={cn(
                                                    'rounded-lg border px-3 py-2.5 text-sm font-semibold tracking-tight transition-colors duration-150',
                                                    data.time === slot
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 text-black/60 hover:border-black hover:text-black',
                                                )}
                                            >
                                                {formatSlotTime(slot)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-black/40">
                                        {selectedDate
                                            ? 'No hay horas disponibles para ese día.'
                                            : 'Elige primero un día.'}
                                    </p>
                                )}
                                {errors.time && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {errors.time}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: barbero */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xs font-semibold tracking-widest text-black/40 uppercase">
                                Elige tu barbero
                            </h2>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {workers.map((worker) => {
                                    const selected =
                                        data.worker_id === worker.id;

                                    return (
                                        <button
                                            key={worker.id}
                                            type="button"
                                            onClick={() =>
                                                pickWorker(worker.id)
                                            }
                                            className={cn(
                                                'flex items-center gap-3 rounded-2xl border bg-white p-5 text-left transition-all duration-200',
                                                selected
                                                    ? 'border-black shadow-md'
                                                    : 'border-gray-200 hover:border-black/40',
                                            )}
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                                                {worker.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                            <span>
                                                <span className="block font-bold tracking-tight text-black">
                                                    {worker.name}
                                                </span>
                                            </span>
                                            <span
                                                className={cn(
                                                    'ml-auto flex h-5 w-5 items-center justify-center rounded-full border text-xs text-white',
                                                    selected
                                                        ? 'border-black bg-black'
                                                        : 'border-gray-300 bg-white text-transparent',
                                                )}
                                            >
                                                ✓
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.worker_id && (
                                <p className="mt-4 text-sm font-medium text-red-600">
                                    {errors.worker_id}
                                </p>
                            )}
                            {workerError && (
                                <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                    {workerError}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Resumen + navegación */}
                    <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-black/60">
                                {selectedServices.length > 0 && (
                                    <p>
                                        {selectedServices
                                            .map((s) => s.name)
                                            .join(' + ')}{' '}
                                        ·{' '}
                                        <strong className="text-black">
                                            {formatMoney(totalPrice)}
                                        </strong>
                                    </p>
                                )}
                                <p className="mt-1">
                                    {data.date && (
                                        <>
                                            {selectedDate?.toLocaleDateString(
                                                'es-MX',
                                                {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                },
                                            )}
                                            {data.time && (
                                                <>
                                                    {' '}
                                                    ·{' '}
                                                    {formatSlotTime(data.time)}
                                                </>
                                            )}
                                        </>
                                    )}
                                    {data.worker_id && (
                                        <>
                                            {' '}
                                            ·{' '}
                                            {
                                                workers.find(
                                                    (w) =>
                                                        w.id ===
                                                        Number(data.worker_id),
                                                )?.name
                                            }
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep((s) => (s - 1) as 1 | 2 | 3)
                                        }
                                        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold tracking-tight text-black/60 transition-colors hover:border-black hover:text-black"
                                    >
                                        <ChevronLeft size={15} />
                                        Atrás
                                    </button>
                                )}

                                {step < 3 && (
                                    <button
                                        type="button"
                                        disabled={
                                            step === 1
                                                ? !canNextFrom1
                                                : step === 2
                                                  ? !(selectedDate && data.time)
                                                  : false
                                        }
                                        onClick={() =>
                                            setStep((s) => (s + 1) as 1 | 2 | 3)
                                        }
                                        className="flex items-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Continuar
                                        <ChevronRight size={15} />
                                    </button>
                                )}

                                {step === 3 && (
                                    <button
                                        type="submit"
                                        disabled={processing || !canSubmit}
                                        className="flex items-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {processing
                                            ? 'Agendando…'
                                            : 'Agendar cita'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </FormLayout>
    );
}
