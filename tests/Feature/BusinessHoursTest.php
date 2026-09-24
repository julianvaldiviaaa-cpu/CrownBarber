<?php

use App\Models\BusinessHour;
use App\Models\BusinessHourOverride;
use App\Models\Service;
use App\Models\User;
use App\UserRoles;
use Illuminate\Support\Carbon;

it('solo los administradores gestionan los horarios', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);
    $worker = User::factory()->create(['role' => UserRoles::Worker->value]);

    $this->actingAs($worker)
        ->get(route('business-hours'))
        ->assertForbidden();

    $this->actingAs($worker)
        ->post(route('business-hours.store'), [
            'day_of_week' => 1,
            'open_time' => '09:00',
            'close_time' => '18:00',
        ])
        ->assertForbidden();

    $this->actingAs($admin)
        ->get(route('business-hours'))
        ->assertOk();

    expect(BusinessHour::count())->toBe(0);
});

it('el administrador crea y actualiza el horario semanal', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);

    $this->actingAs($admin)->post(route('business-hours.store'), [
        'day_of_week' => 1,
        'open_time' => '09:00',
        'close_time' => '18:00',
        'active' => true,
    ])->assertRedirect();

    $hour = BusinessHour::where('day_of_week', 1)->firstOrFail();

    expect($hour->open_time)->toBe('09:00');
    expect($hour->close_time)->toBe('18:00');

    $this->actingAs($admin)->put(route('business-hours.update', $hour), [
        'day_of_week' => 1,
        'open_time' => '10:00',
        'close_time' => '20:00',
        'active' => true,
    ])->assertRedirect();

    expect($hour->fresh()->close_time)->toBe('20:00');
});

it('crea una excepción de cierre por fecha y bloquea la disponibilidad', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);
    $worker = User::factory()->create(['role' => UserRoles::Worker->value]);
    $service = Service::factory()->create(['duration' => 30]);

    $date = Carbon::tomorrow()->format('Y-m-d');
    $dayOfWeek = (Carbon::tomorrow()->dayOfWeek + 6) % 7;

    BusinessHour::create([
        'day_of_week' => $dayOfWeek,
        'open_time' => '09:00',
        'close_time' => '18:00',
        'active' => true,
    ]);

    $this->actingAs($admin)->post(route('business-hours.overrides.store'), [
        'date' => $date,
        'is_closed' => true,
    ])->assertRedirect();

    expect(BusinessHourOverride::where('date', $date)->firstOrFail()->is_closed)->toBeTrue();

    $response = $this->actingAs($admin)
        ->get(route('appointments.availability', [
            'date' => $date,
            'worker_id' => $worker->id,
            'services' => [$service->id],
        ]))
        ->assertOk();

    expect($response->json('slots'))->toBe([]);
});

it('la excepción con horario especial tiene prioridad sobre el semanal', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);
    $worker = User::factory()->create(['role' => UserRoles::Worker->value]);
    $service = Service::factory()->create(['duration' => 30]);

    $date = Carbon::tomorrow()->format('Y-m-d');
    $dayOfWeek = (Carbon::tomorrow()->dayOfWeek + 6) % 7;

    BusinessHour::create([
        'day_of_week' => $dayOfWeek,
        'open_time' => '09:00',
        'close_time' => '18:00',
        'active' => true,
    ]);

    BusinessHourOverride::create([
        'date' => $date,
        'open_time' => '14:00',
        'close_time' => '15:00',
        'is_closed' => false,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('appointments.availability', [
            'date' => $date,
            'worker_id' => $worker->id,
            'services' => [$service->id],
        ]))
        ->assertOk();

    expect($response->json('slots'))->toBe(['14:00', '14:30']);
});

it('la disponibilidad sin barbero usa solo el horario del negocio', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);
    $service = Service::factory()->create(['duration' => 30]);

    $date = Carbon::tomorrow()->format('Y-m-d');
    $dayOfWeek = (Carbon::tomorrow()->dayOfWeek + 6) % 7;

    BusinessHour::create([
        'day_of_week' => $dayOfWeek,
        'open_time' => '14:00',
        'close_time' => '15:00',
        'active' => true,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('appointments.availability', [
            'date' => $date,
            'services' => [$service->id],
        ]))
        ->assertOk();

    expect($response->json('slots'))->toBe(['14:00', '14:30']);
});

it('elimina una excepción y restaura el horario semanal', function () {
    $admin = User::factory()->create(['role' => UserRoles::Admin->value]);

    $date = Carbon::tomorrow()->format('Y-m-d');
    $override = BusinessHourOverride::create([
        'date' => $date,
        'is_closed' => true,
    ]);

    $this->actingAs($admin)
        ->delete(route('business-hours.overrides.destroy', $override))
        ->assertRedirect();

    expect(BusinessHourOverride::count())->toBe(0);
});
