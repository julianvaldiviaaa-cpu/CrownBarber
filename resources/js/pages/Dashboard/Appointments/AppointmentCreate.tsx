import { Button } from '@heroui/react';
import { router, useForm, usePoll } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Scissors,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import FormLayout from '@/Layouts/FormLayout';
import {
    cn,
    formatMoney,
    formatSlotTime,
    POLL_INTERVAL_MS,
    toISODate,
} from '@/lib/utils';
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
    usePoll(POLL_INTERVAL_MS, { only: ['businessHours'] });
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [retry, setRetry] = useState(0);
    const heading = useRef<HTMLHeadingElement>(null);

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
        setData('time', '');
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

        if (errors.date) {
            clearErrors('date');
        }
    };

    const pickWorker = (workerId: number | string) => {
        setData('worker_id', workerId);
        setData('time', '');

        if (errors.worker_id) {
            clearErrors('worker_id');
        }
    };

    const slotsUrl =
        data.date && data.worker_id && data.services.length
            ? availability.url({
                  query: {
                      date: data.date,
                      worker_id: data.worker_id,
                      services: data.services,
                  },
              })
            : '';
    const requestKey = JSON.stringify([slotsUrl, businessHours, retry]);
    const [result, setResult] = useState<{
        key: string;
        slots: string[];
        error: string | null;
    } | null>(null);
    const loadingSlots = Boolean(slotsUrl && result?.key !== requestKey);
    const slots = result?.key === requestKey ? result.slots : [];
    const slotError = result?.key === requestKey ? result.error : null;

    useEffect(() => {
        if (!slotsUrl) {
            return;
        }

        const controller = new AbortController();
        void fetch(slotsUrl, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Error al consultar disponibilidad');
                }

                const payload = await response.json();

                if (!Array.isArray(payload.slots)) {
                    throw new Error('Respuesta inválida');
                }

                if (!controller.signal.aborted) {
                    setResult({
                        key: requestKey,
                        slots: payload.slots,
                        error: null,
                    });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setResult({
                        key: requestKey,
                        slots: [],
                        error: 'No pudimos consultar las horas. Revisa tu conexión e inténtalo de nuevo.',
                    });
                }
            });

        return () => controller.abort();
    }, [slotsUrl, requestKey]);

    const goToStep = (next: 1 | 2 | 3) => {
        setStep(next);
        heading.current?.focus();
        heading.current?.scrollIntoView({
            block: 'start',
            behavior: 'instant',
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (step !== 3 || !canSubmit || processing) {
            return;
        }

        post(store.url(), {
            onError: (validation) => {
                goToStep(
                    validation.services ? 1 : validation.worker_id ? 2 : 3,
                );
                setRetry((value) => value + 1);
            },
        });
    };

    const canNextFrom1 = data.services.length > 0;
    const canSubmit =
        selectedDate &&
        data.time &&
        data.worker_id &&
        !loadingSlots &&
        !slotError &&
        slots.includes(data.time);
    const selectedOverride = businessHours.overrides.find(
        (item) => item.date === data.date,
    );

    return (
        <FormLayout navbar="dashboard">
            <Button
                onClick={() => router.get(dashboard.url())}
                className="mb-5 flex min-h-12 items-center justify-center gap-2 bg-black text-white"
            >
                <ChevronLeft /> Dashboard
            </Button>

            <div className="mx-auto w-full max-w-4xl pb-56 sm:pb-8">
                <h1
                    ref={heading}
                    tabIndex={-1}
                    className="scroll-mt-6 text-3xl font-bold tracking-tight text-black outline-none md:text-5xl"
                >
                    Agendar cita
                </h1>
                <p className="mt-2 text-base font-medium tracking-tight text-black/60">
                    Paso {step} de 3 · {selectedServices.length}{' '}
                    {selectedServices.length === 1 ? 'servicio' : 'servicios'} ·{' '}
                    {formatMoney(totalPrice)} · {totalDuration} min
                </p>

                {/* Indicador de pasos */}
                <nav
                    aria-label="Pasos para agendar"
                    className="mt-6 grid grid-cols-3 gap-2"
                >
                    {(['Servicios', 'Barbero', 'Día y hora'] as const).map(
                        (label, index) => {
                            const stepNumber = (index + 1) as 1 | 2 | 3;
                            const isActive = step === stepNumber;
                            const isDone = step > stepNumber;

                            return (
                                <button
                                    key={label}
                                    type="button"
                                    aria-current={isActive ? 'step' : undefined}
                                    onClick={() => goToStep(stepNumber)}
                                    disabled={
                                        processing ||
                                        (stepNumber > 1 &&
                                            (!canNextFrom1 ||
                                                (stepNumber === 3 &&
                                                    !data.worker_id)))
                                    }
                                    className={cn(
                                        'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-sm font-semibold transition-colors sm:flex-row sm:gap-2 sm:text-base',
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
                </nav>

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
                                            aria-pressed={selected}
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
                                                <p className="text-lg font-bold tracking-tight text-black">
                                                    {service.name}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 text-sm text-black/45">
                                                    {service.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-base">
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
                    {step === 3 && (
                        <div className="flex flex-col gap-8">
                            <div>
                                <h2 className="text-xl font-bold text-black">
                                    Elige el día
                                </h2>
                                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                                    {openDays.map((date) => {
                                        const selected =
                                            selectedDate?.toDateString() ===
                                            date.toDateString();

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                type="button"
                                                onClick={() => pickDate(date)}
                                                aria-pressed={selected}
                                                aria-label={date.toLocaleDateString(
                                                    'es-MX',
                                                    { dateStyle: 'full' },
                                                )}
                                                className={cn(
                                                    'flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 transition-colors',
                                                    selected
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-200 bg-white text-black hover:border-black',
                                                )}
                                            >
                                                <span className="text-sm font-medium opacity-75">
                                                    {DAY_LABELS[date.getDay()]}
                                                </span>
                                                <span className="text-2xl font-extrabold tracking-tight">
                                                    {date.getDate()}
                                                </span>
                                                <span className="text-sm font-medium opacity-75">
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

                            <div aria-live="polite" aria-busy={loadingSlots}>
                                <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                                    <Clock size={13} />
                                    Hora disponible
                                </h2>
                                {selectedOverride?.open_time &&
                                    selectedOverride.close_time &&
                                    !selectedOverride.is_closed && (
                                        <p className="mt-2 text-base text-black/65">
                                            Horario especial:{' '}
                                            {formatSlotTime(
                                                selectedOverride.open_time,
                                            )}{' '}
                                            a{' '}
                                            {formatSlotTime(
                                                selectedOverride.close_time,
                                            )}
                                            . Tu cita dura {totalDuration}{' '}
                                            minutos.
                                        </p>
                                    )}

                                {loadingSlots ? (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-black/50">
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Consultando disponibilidad…
                                    </div>
                                ) : slotError ? (
                                    <div
                                        role="alert"
                                        className="mt-3 rounded-2xl bg-amber-50 p-4 text-base"
                                    >
                                        <p>{slotError}</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRetry((value) => value + 1)
                                            }
                                            className="mt-2 min-h-12 font-bold underline"
                                        >
                                            Volver a intentar
                                        </button>
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="mt-3 grid grid-cols-2 gap-3 min-[380px]:grid-cols-3 sm:grid-cols-4">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                aria-pressed={
                                                    data.time === slot
                                                }
                                                onClick={() => {
                                                    setData('time', slot);

                                                    if (errors.time) {
                                                        clearErrors('time');
                                                    }
                                                }}
                                                className={cn(
                                                    'min-h-14 rounded-xl border-2 px-2 py-3 text-base font-semibold transition-colors',
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
                                    <p className="mt-3 rounded-2xl bg-gray-100 p-4 text-base text-black/65">
                                        {selectedDate
                                            ? `No quedan horas para ${totalDuration} minutos con este barbero. Prueba otro día o cambia de barbero.`
                                            : 'Elige primero un día.'}
                                    </p>
                                )}
                                {errors.time && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {errors.time}
                                    </p>
                                )}
                                {data.time &&
                                    !loadingSlots &&
                                    !slots.includes(data.time) && (
                                        <p
                                            role="alert"
                                            className="mt-3 text-base text-amber-800"
                                        >
                                            La hora elegida ya no está
                                            disponible. Selecciona otra.
                                        </p>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: barbero */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-black">
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
                                            aria-pressed={selected}
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
                        </div>
                    )}

                    {/* Resumen + navegación */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg sm:sticky sm:bottom-4 sm:mt-10 sm:rounded-2xl sm:border sm:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0 text-sm text-black/65">
                                {selectedServices.length > 0 && (
                                    <p className="line-clamp-2">
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
                                            goToStep((step - 1) as 1 | 2 | 3)
                                        }
                                        disabled={processing}
                                        className="flex min-h-14 items-center justify-center gap-1 rounded-xl border border-gray-300 px-4 text-base font-semibold text-black"
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
                                                  ? !data.worker_id
                                                  : false
                                        }
                                        onClick={() =>
                                            goToStep((step + 1) as 1 | 2 | 3)
                                        }
                                        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-base font-bold text-white disabled:opacity-40"
                                    >
                                        {step === 1
                                            ? 'Elegir barbero'
                                            : 'Elegir día y hora'}
                                        <ChevronRight size={15} />
                                    </button>
                                )}

                                {step === 3 && (
                                    <button
                                        type="submit"
                                        disabled={processing || !canSubmit}
                                        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-base font-bold text-white disabled:opacity-40"
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
