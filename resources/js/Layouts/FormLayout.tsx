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
            <div className="mx-auto mt-12 mb-12 max-w-5xl p-2">{children}</div>
        </>
    );
}
