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

const ROLES = [
    { value: 'user', label: 'Cliente' },
    { value: 'worker', label: 'Trabajador' },
    { value: 'admin', label: 'Administrador' },
];

export default function WorkerCreate() {
    const { data, setData, errors, clearErrors, post, reset, processing } =
        useForm({
            name: '',
            email: '',
            phone: '',
            role: '',
            password: '',
            password_confirmation: '',
        });

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        post(route('workers.store'), {
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
                className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl bg-black px-6 py-12 md:px-12"
            >
                <h1 className="text-center text-4xl font-medium tracking-[-0.02em] text-white md:text-5xl">
                    Nuevo Empleado
                </h1>
                <p className="mx-auto my-6 max-w-sm text-center text-base/6 tracking-tight text-white/60">
                    Llena el siguiente formulario para dar de alta a un nuevo
                    empleado y asignarle su rol
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
                            Nombre
                        </Label>
                        <Input
                            placeholder="Nombre completo"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.name}
                        </FieldError>
                    </TextField>

                    <TextField
                        isRequired
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
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Correo electrónico
                        </Label>
                        <Input
                            placeholder="tu@correo.com"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.email}
                        </FieldError>
                    </TextField>

                    <TextField
                        isRequired
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
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Teléfono
                        </Label>
                        <Input
                            placeholder="10 dígitos"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.phone}
                        </FieldError>
                    </TextField>

                    {/* Rol — select nativo estilizado para combinar con el resto de los campos */}
                    <div className="col-span-1 flex flex-col gap-2 md:col-span-2">
                        <label
                            htmlFor="role"
                            className="text-sm font-medium tracking-tight text-white/80"
                        >
                            Rol
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={data.role}
                            onChange={(e) => {
                                setData(
                                    'role',
                                    e.target.value as
                                        'user' | 'worker' | 'admin',
                                );

                                if (errors.role) {
                                    clearErrors('role');
                                }
                            }}
                            className="bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23ffffff80%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')] w-full appearance-none rounded-lg bg-white/5 bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-white transition-colors duration-150 outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="" disabled className="text-black">
                                Selecciona un rol
                            </option>
                            {ROLES.map((role) => (
                                <option
                                    key={role.value}
                                    value={role.value}
                                    className="text-black"
                                >
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-sm font-medium text-red-500">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <TextField
                        isRequired
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
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Contraseña
                        </Label>
                        <Input
                            placeholder="Mínimo 8 caracteres"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.password}
                        </FieldError>
                    </TextField>

                    <TextField
                        isRequired
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
                    >
                        <Label className="text-sm font-medium tracking-tight text-white/80">
                            Confirmar contraseña
                        </Label>
                        <Input
                            placeholder="Repite la contraseña"
                            className="w-full rounded-lg bg-white/5 px-4 py-3 text-white transition-colors duration-150 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
                        />
                        <FieldError className="text-sm font-medium text-red-500">
                            {errors.password_confirmation}
                        </FieldError>
                    </TextField>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-10 w-full max-w-xs bg-amber-500 py-3.5 text-lg font-semibold tracking-tight text-black transition-transform duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Creando…' : 'Crear Empleado'}
                </button>
            </Form>
        </FormLayout>
    );
}
