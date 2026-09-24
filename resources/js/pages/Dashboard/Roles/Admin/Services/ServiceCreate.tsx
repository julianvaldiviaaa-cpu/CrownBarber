import {
    FieldError,
    Form,
    Input,
    Label,
    TextField,
    Button,
} from '@heroui/react';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { route } from 'ziggy-js';
import FormLayout from '@/Layouts/FormLayout';

export default function ServiceCreate() {
    const { data, setData, errors, clearErrors, post, processing, reset } =
        useForm({
            name: '',
            description: '',
            price: 0,
            duration: 0,
        });

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('services.store'), {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <FormLayout navbar="dashboard">
            <Button
                onClick={() => router.get(route('dashboard'))}
                className="mb-10 flex items-center justify-center gap-2 bg-black text-gray-300 transition-all duration-300 hover:gap-4"
            >
                <ChevronLeft /> Dashboard
            </Button>
            <Form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl bg-black px-6 py-12 md:px-12 md:py-20"
            >
                <h2 className="text-center text-4xl font-medium tracking-[-0.02em] text-white capitalize md:text-5xl">
                    Crear Servicio
                </h2>
                <p className="mx-auto my-6 max-w-sm text-center text-base/6 tracking-tight text-white/60">
                    Llena el siguiente formulario para crear un servicio que
                    podrás ofrecer a tus clientes
                </p>

                <div className="mt-6 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    <TextField
                        isRequired
                        name="name"
                        type="text"
                        value={data.name}
                        onChange={(value) => {
                            setData('name', value);

                            if (errors.name) {
                                clearErrors('name');
                            }
                        }}
                        isInvalid={!!errors.name}
                        className="col-span-1 md:col-span-2"
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Nombre del Servicio
                        </Label>
                        <Input
                            placeholder="Ej. Corte Clásico"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.name}
                        </FieldError>
                    </TextField>

                    <div className="col-span-1 flex flex-col gap-2 md:col-span-2">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium tracking-tight text-white/80"
                        >
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) => {
                                setData('description', e.target.value);

                                if (errors.description) {
                                    clearErrors('description');
                                }
                            }}
                            placeholder="Describe en qué consiste el servicio"
                            className="w-full resize-none rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        {errors.description && (
                            <p className="text-sm font-medium text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <TextField
                        isRequired
                        name="price"
                        type="number"
                        value={String(data.price)}
                        onChange={(value) => {
                            setData('price', Number(value));

                            if (errors.price) {
                                clearErrors('price');
                            }
                        }}
                        isInvalid={!!errors.price}
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Precio
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/40">
                                $
                            </span>
                            <Input
                                placeholder="0.00"
                                min={0}
                                step="0.01"
                                className="w-full rounded-lg bg-white/5 py-3 pr-4 pl-8 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.price}
                        </FieldError>
                    </TextField>

                    <TextField
                        isRequired
                        name="duration"
                        type="number"
                        value={String(data.duration)}
                        onChange={(value) => {
                            setData('duration', Number(value));

                            if (errors.duration) {
                                clearErrors('duration');
                            }
                        }}
                        isInvalid={!!errors.duration}
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Duración
                        </Label>
                        <div className="relative">
                            <Input
                                placeholder="30"
                                min={0}
                                className="w-full rounded-lg bg-white/5 py-3 pr-16 pl-4 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-white/40">
                                min
                            </span>
                        </div>
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.duration}
                        </FieldError>
                    </TextField>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-10 w-full max-w-xs bg-white py-3.5 text-lg font-semibold tracking-tight text-black transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Guardando…' : 'Crear Servicio'}
                </button>
            </Form>
        </FormLayout>
    );
}
