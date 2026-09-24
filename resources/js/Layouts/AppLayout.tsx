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
            <div className="p-8">{children}</div>
        </>
    );
}
