import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { sileo, Toaster } from 'sileo';

export default function FlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            sileo.success({
                title: 'Echo!',
                description: flash.success,
                duration: 5000,
            });
        }

        if (flash?.error) {
            sileo.error({
                title: 'error',
                description: flash.error,
                duration: 5000,
                fill: 'black',
            });
        }
    }, [flash]);

    return <Toaster theme="light" position="bottom-right" />;
}
