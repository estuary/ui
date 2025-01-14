import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import { useEffect } from 'react';
import { useMount } from 'react-use';
import { useEntityStatusStore } from './Store';
import { HydratorProps } from './types';

export default function EntityStatusHydrator({
    catalogName,
    children,
}: HydratorProps) {
    const { data, error, refresh } = useEntityStatus(catalogName);

    const hydrated = useEntityStatusStore((state) => state.hydrated);
    const setHydrated = useEntityStatusStore((state) => state.setHydrated);
    const setHydrationError = useEntityStatusStore(
        (state) => state.setHydrationError
    );

    const setActive = useEntityStatusStore((state) => state.setActive);

    useMount(() => {
        setActive(true);
    });

    useEffect(() => {
        if (!hydrated) {
            if (data) {
                setHydrated(true);
                setActive(false);
            } else if (error) {
                setHydrated(true);
                setHydrationError(error);
            }
        }
    }, [
        data,
        error,
        hydrated,
        refresh,
        setActive,
        setHydrated,
        setHydrationError,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
