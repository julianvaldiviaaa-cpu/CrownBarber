import type { ReactNode } from 'react';
import FlashMessages from '@/Components/FlashMessages';
import Navbar from '@/Components/Navbar';
import NotificationRuntime from '@/Components/Notifications/NotificationRuntime';

type Props = {
    children: ReactNode;
    navbar: 'dashboard' | 'guest';
};

export default function AppLayout({ children, navbar }: Props) {
    return (
        <>
            <FlashMessages />
            <NotificationRuntime />
            <Navbar navbar={navbar} />
            <main className="px-4 py-6 sm:p-8">{children}</main>
        </>
    );
}
