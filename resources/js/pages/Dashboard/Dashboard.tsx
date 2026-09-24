import { Link, usePage, usePoll } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { POLL_INTERVAL_MS } from '@/lib/utils';
import type { AdminDashboardStats, Appointment, Paginated } from '@/types';
import AdminDashboard from './Roles/Admin/AdminDashboard';
import UserDashboard from './Roles/User/UserDashboard';
import WorkerDashboard from './Roles/Worker/WorkerDashboard';

type Props = {
    stats: AdminDashboardStats | null;
    appointments: Paginated<Appointment>;
};

export default function Dashboard({ stats, appointments }: Props) {
    usePoll(POLL_INTERVAL_MS, { only: ['appointments', 'stats'] });

    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AppLayout navbar="dashboard">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl tracking-tight sm:text-5xl md:text-7xl">
                    Hola, <span className="font-medium">{user?.name}</span>
                </h1>

                {user?.role === 'admin' && (
                    <AdminDashboard
                        stats={stats!}
                        appointments={appointments}
                    />
                )}
                {user?.role === 'worker' && (
                    <WorkerDashboard appointments={appointments} />
                )}
                {user?.role === 'user' && (
                    <UserDashboard appointments={appointments} />
                )}
                {appointments.last_page > 1 && (
                    <nav
                        aria-label="Páginas de citas"
                        className="mt-8 flex items-center justify-center gap-5 text-sm"
                    >
                        {appointments.prev_page_url && (
                            <Link
                                href={appointments.prev_page_url}
                                className="rounded-full border border-gray-300 px-4 py-2"
                            >
                                Anterior
                            </Link>
                        )}
                        <span>
                            Página {appointments.current_page} de{' '}
                            {appointments.last_page}
                        </span>
                        {appointments.next_page_url && (
                            <Link
                                href={appointments.next_page_url}
                                className="rounded-full border border-gray-300 px-4 py-2"
                            >
                                Siguiente
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
