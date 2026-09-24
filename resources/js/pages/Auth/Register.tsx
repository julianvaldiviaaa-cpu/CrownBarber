import { FieldError, Form, Input, Label, TextField } from '@heroui/react';
import { Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { route } from 'ziggy-js';
import FormLayout from '@/Layouts/FormLayout';

export default function Register() {
    const { data, setData, errors, clearErrors, post, processing, reset } =
        useForm({
            name: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
        });

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('register.store'), {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <FormLayout navbar="guest">
            <div className="relative grid w-full grid-cols-1 gap-2 rounded-3xl bg-black p-2 md:min-h-[640px] md:grid-cols-2">
                {/* Panel de marca */}
                <div className="relative hidden h-full w-full md:block">
                    <img
                        src="https://i.pinimg.com/736x/01/4f/ef/014fef67d8f3eba0b8f38ae30d7c7fa1.jpg"
                        alt="Interior de la barbería Crown Barber"
                        className="absolute top-0 left-0 h-full w-full rounded-2xl object-cover"
                    />
                    <div className="absolute top-0 left-0 z-10 h-full w-full rounded-2xl bg-black/60" />
                    <div className="absolute top-1/2 left-1/2 z-20 w-full max-w-xs -translate-1/2 px-4">
                        <h2 className="text-center text-4xl/10 tracking-[-0.02em] text-white">
                            Regístrate en <br />
                            <span className="font-bold">Crown Barber</span>
                        </h2>
                        <p className="my-4 text-center text-sm/5 text-white/70">
                            Llena el siguiente formulario para crear tu cuenta y
                            disfrutar de todos nuestros servicios
                        </p>
                        <div className="mx-auto h-px w-60 bg-white/20" />
                        <Link
                            href={route('login')}
                            className="group mx-auto my-8 flex w-full items-center justify-center gap-2 bg-white py-4 text-center text-lg font-medium tracking-tight text-black transition-transform duration-150 active:scale-[0.97]"
                        >
                            Iniciar Sesión
                            <LogIn
                                size={20}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>
                </div>

                {/* Formulario */}
                <div className="flex flex-col items-center justify-center px-6 py-10">
                    <h2 className="text-3xl font-medium tracking-[-0.01em] text-white">
                        Registrarse
                    </h2>

                    <Form
                        onSubmit={handleSubmit}
                        className="mt-10 flex w-full max-w-100 flex-col gap-5"
                    >
                        <TextField
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
                            isRequired
                        >
                            <Label className="text-sm font-medium tracking-tight text-white/80">
                                Nombre
                            </Label>
                            <Input
                                placeholder="Tu nombre"
                                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white"
                            />
                            <FieldError className="text-sm font-medium text-red-500">
                                {errors.name}
                            </FieldError>
                        </TextField>

                        <TextField
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(value) => {
                                setData('email', value);

                                if (errors.email) {
                                    clearErrors('email');
                                }
                            }}
                            isInvalid={!!errors.email}
                            isRequired
                        >
                            <Label className="text-sm font-medium tracking-tight text-white/80">
                                Correo electrónico
                            </Label>
                            <Input
                                placeholder="tu@correo.com"
                                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white"
                            />
                            <FieldError className="text-sm font-medium text-red-500">
                                {errors.email}
                            </FieldError>
                        </TextField>

                        <TextField
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(value) => {
                                setData('phone', value);

                                if (errors.phone) {
                                    clearErrors('phone');
                                }
                            }}
                            isInvalid={!!errors.phone}
                            isRequired
                        >
                            <Label className="text-sm font-medium tracking-tight text-white/80">
                                Teléfono
                            </Label>
                            <Input
                                placeholder="10 dígitos"
                                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white"
                            />
                            <FieldError className="text-sm font-medium text-red-500">
                                {errors.phone}
                            </FieldError>
                        </TextField>

                        <TextField
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={(value) => {
                                setData('password', value);

                                if (errors.password) {
                                    clearErrors('password');
                                }
                            }}
                            isInvalid={!!errors.password}
                            isRequired
                        >
                            <Label className="text-sm font-medium tracking-tight text-white/80">
                                Contraseña
                            </Label>
                            <Input
                                placeholder="Mínimo 8 caracteres"
                                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white"
                            />
                            <FieldError className="text-sm font-medium text-red-500">
                                {errors.password}
                            </FieldError>
                        </TextField>

                        <TextField
                            name="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(value) => {
                                setData('password_confirmation', value);

                                if (errors.password_confirmation) {
                                    clearErrors('password_confirmation');
                                }
                            }}
                            isInvalid={!!errors.password_confirmation}
                            isRequired
                        >
                            <Label className="text-sm font-medium tracking-tight text-white/80">
                                Confirmar contraseña
                            </Label>
                            <Input
                                placeholder="Repite tu contraseña"
                                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-white"
                            />
                            <FieldError className="text-sm font-medium text-red-500">
                                {errors.password_confirmation}
                            </FieldError>
                        </TextField>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-3 w-full bg-white py-3.5 text-lg font-semibold tracking-tight text-black transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Creando cuenta…' : 'Crear Cuenta'}
                        </button>

                        <Link
                            href={route('login')}
                            className="text-center text-sm font-medium tracking-tight text-white/60 transition-colors duration-150 hover:text-white md:hidden"
                        >
                            ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                    </Form>
                </div>
            </div>
        </FormLayout>
    );
}
