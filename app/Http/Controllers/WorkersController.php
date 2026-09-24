<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddWorkerRequest;
use App\Http\Requests\UpdateRoleWorkerRequest;
use App\Http\Requests\UpdateWorkerRequest;
use App\Models\User;
use App\UserRoles;
use Illuminate\Auth\Events\Registered;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Inertia\Inertia;

class WorkersController extends Controller
{
    #[Authorize('viewAny', User::class)]
    public function index()
    {
        return Inertia::render(
            'Dashboard/Roles/Admin/Workers/Workers',
            [
                'workers' => User::where(
                    'role',
                    UserRoles::Worker->value
                )->paginate(10),
                'admins' => User::where(
                    'role',
                    UserRoles::Admin->value
                )->paginate(10),
            ]
        );
    }

    #[Authorize('create', User::class)]
    public function create()
    {
        return Inertia::render(
            'Dashboard/Roles/Admin/Workers/WorkerCreate'
        );
    }

    #[Authorize('create', User::class)]
    public function store(AddWorkerRequest $request)
    {
        $user = User::create(
            $request->validated()
        );

        event(new Registered($user));

        return redirect()
            ->route('workers.show', $user)
            ->with(
                'success',
                'Trabajador creado correctamente.'
            );
    }

    #[Authorize('view', 'worker')]
    public function show(User $worker)
    {
        return Inertia::render(
            'Dashboard/Roles/Admin/Workers/WorkerShow',
            [
                'worker' => $worker,
            ]
        );
    }

    #[Authorize('update', 'worker')]
    public function update(
        UpdateWorkerRequest $request,
        User $worker
    ) {
        $worker->update(
            $request->validated()
        );

        return redirect()
            ->route('workers.show', $worker)
            ->with(
                'success',
                'Trabajador actualizado correctamente.'
            );
    }

    #[Authorize('updateRole', 'worker')]
    public function updateRole(
        UpdateRoleWorkerRequest $request,
        User $worker
    ) {
        $worker->update(
            $request->validated()
        );

        return redirect()
            ->route('workers.show', $worker)
            ->with(
                'success',
                'Rol cambiado correctamente.'
            );
    }

    #[Authorize('delete', 'worker')]
    public function destroy(User $worker)
    {
        $worker->delete();

        return redirect()
            ->route('workers')
            ->with(
                'success',
                'Trabajador eliminado correctamente.'
            );
    }
}
