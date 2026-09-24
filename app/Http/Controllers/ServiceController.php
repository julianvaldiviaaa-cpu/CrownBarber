<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Http\Requests\UpdateActiveServiceRequest;
use App\Models\Service;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Inertia\Inertia;

class ServiceController extends Controller
{
    #[Authorize('viewAny', Service::class)]
    public function index()
    {
        $services = Service::latest()->paginate(10);

        return Inertia::render(
            'Dashboard/Roles/Admin/Services/Services',
            [
                'services' => $services,
            ]
        );
    }

    #[Authorize('create', Service::class)]
    public function create()
    {
        return Inertia::render(
            'Dashboard/Roles/Admin/Services/ServiceCreate'
        );
    }

    #[Authorize('create', Service::class)]
    public function store(ServiceRequest $request)
    {
        $service = Service::create(
            $request->validated()
        );

        return redirect()
            ->route('services.show', $service)
            ->with(
                'success',
                'Servicio creado correctamente.'
            );
    }

    #[Authorize('view', 'service')]
    public function show(Service $service)
    {
        return Inertia::render(
            'Dashboard/Roles/Admin/Services/ServiceShow',
            [
                'service' => $service,
            ]
        );
    }

    #[Authorize('update', 'service')]
    public function update(
        ServiceRequest $request,
        Service $service
    ) {
        $service->update(
            $request->validated()
        );

        return redirect()->route('services.show', $service)->with(
            'success',
            'Servicio actualizado correctamente.'
        );
    }

    #[Authorize('update', 'service')]
    public function updateActive(
        UpdateActiveServiceRequest $request,
        Service $service
    ) {
        $service->update(
            $request->validated()
        );

        return back()->with(
            'success',
            'Estado del servicio actualizado correctamente.'
        );
    }

    #[Authorize('delete', 'service')]
    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()
            ->route('services')
            ->with(
                'success',
                'Servicio eliminado correctamente.'
            );
    }
}
