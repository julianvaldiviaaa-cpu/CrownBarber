import type { ReactNode } from 'react';
import FlashMessages from '@/Components/FlashMessages';
import Navbar from '@/Components/Navbar';

type Props = {
    children: ReactNode;
    navbar: 'dashboard' | 'guest';
};

export default function FormLayout({ children, navbar }: Props) {
    return (
        <>
            <FlashMessages />
            <Navbar navbar={navbar} />
            <main className="mx-auto my-6 max-w-5xl px-4 sm:my-12 sm:px-6">
                {children}
            </main>
        </>
    );
}
