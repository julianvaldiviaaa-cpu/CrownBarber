<?php

namespace App\Http\Controllers;

use App\Models\BusinessHour;
use App\Models\Service;
use App\Models\User;
use App\UserRoles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome', [
            'services' => $this->servicesQuery()->take(4)->get(),
            'barbers' => $this->barbersList()->take(4)->values(),
        ]);
    }

    public function services(): Response
    {
        return Inertia::render('Services', ['services' => $this->servicesQuery()->get()]);
    }

    public function barbers(): Response
    {
        return Inertia::render('Barbers', ['barbers' => $this->barbersList()]);
    }

    public function experience(): Response
    {
        return Inertia::render('Experience', [
            'hours' => BusinessHour::orderBy('day_of_week')
                ->get(['day_of_week', 'open_time', 'close_time', 'active']),
        ]);
    }

    /** @return Builder<Service> */
    private function servicesQuery(): Builder
    {
        return Service::query()->where('active', true)->orderBy('name')
            ->select(['id', 'name', 'description', 'price', 'duration', 'slug']);
    }

    /** @return Collection<int, User> */
    private function barbersList(): Collection
    {
        return User::whereIn('role', [UserRoles::Worker, UserRoles::Admin])
            ->orderBy('name')->get(['id', 'name']);
    }
}
