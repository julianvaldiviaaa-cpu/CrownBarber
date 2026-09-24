<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterAppointmentsRequest;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use App\UserRoles;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(FilterAppointmentsRequest $request): Response
    {
        $user = $request->user();
        $filters = $request->filters();
        $isAdmin = $user->role === UserRoles::Admin;

        // El cliente ve sus citas; el barbero (worker/admin) las suyas.
        $appointments = Appointment::query()
            ->with(['user:id,name,phone', 'worker:id,name', 'services'])
            ->where(
                ($isAdmin || $user->role === UserRoles::Worker) ? 'worker_id' : 'user_id',
                $user->id,
            )
            ->filtered($filters)
            ->orderBy('starts_at')
            ->orderBy('id')
            ->paginate(10)->withQueryString();

        return Inertia::render('Dashboard/Dashboard', [
            'stats' => $isAdmin ? [
                'services' => Service::count(),
                'workers' => User::where('role', UserRoles::Worker->value)->count(),
            ] : null,
            'appointments' => $appointments,
            'filters' => $filters,
        ]);
    }
}
