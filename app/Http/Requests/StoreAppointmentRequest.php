<?php

namespace App\Http\Requests;

use App\Models\Service;
use App\Services\BusinessHoursService;
use App\UserRoles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === UserRoles::User;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'worker_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->whereIn('role', [
                    UserRoles::Worker->value,
                    UserRoles::Admin->value,
                ])->withoutTrashed(),
            ],

            'services' => [
                'required',
                'array',
                'min:1',
            ],
            'services.*' => [
                'required',
                'integer',
                'distinct',
                'exists:services,id',
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],

            'time' => [
                'required',
                'date_format:H:i',
            ],
        ];
    }

    /**
     * Validaciones de negocio que dependen de los datos ya resueltos
     * (horario de apertura, solapamientos, servicios activos).
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $services = Service::whereIn('id', $this->input('services', []))
                    ->where('active', true)
                    ->get();

                if ($services->count() !== count(array_unique($this->input('services', [])))) {
                    $validator->errors()->add(
                        'services',
                        'Uno o más servicios seleccionados no están disponibles.'
                    );

                    return;
                }

                $totalDuration = (int) $services->sum('duration');
                $startsAt = Carbon::parse(
                    $this->input('date').' '.$this->input('time')
                );

                $businessHours = app(BusinessHoursService::class);

                if ($startsAt->isPast()) {
                    $validator->errors()->add('time', 'La hora elegida ya pasó.');
                }

                if (! $businessHours->isWithinHours($startsAt, $totalDuration)) {
                    $validator->errors()->add(
                        'time',
                        'La barbería no está abierta en ese día u hora para la duración de la cita.'
                    );
                }

                if ($businessHours->hasConflict((int) $this->input('worker_id'), $startsAt, $totalDuration)) {
                    $validator->errors()->add(
                        'time',
                        'El barbero ya tiene una cita en ese horario. Elige otra hora.'
                    );
                }
            },
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'worker_id.required' => 'Debes elegir un barbero.',
            'worker_id.exists' => 'El barbero seleccionado no existe.',
            'worker_id.role' => 'El barbero seleccionado no está habilitado para atender.',

            'services.required' => 'Selecciona al menos un servicio.',
            'services.array' => 'Los servicios no son válidos.',
            'services.min' => 'Selecciona al menos un servicio.',
            'services.*.exists' => 'Uno de los servicios seleccionados no existe.',
            'services.*.distinct' => 'No puedes repetir servicios.',

            'date.required' => 'Elige un día para tu cita.',
            'date.after_or_equal' => 'La cita debe ser en un día futuro.',

            'time.required' => 'Elige una hora para tu cita.',
            'time.date_format' => 'La hora no tiene un formato válido.',
        ];
    }
}
