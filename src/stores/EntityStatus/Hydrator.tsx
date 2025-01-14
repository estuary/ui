import useEntityStatus from 'hooks/entityStatus/useEntityStatus';
import { useEffect } from 'react';
import { useMount } from 'react-use';
import { useEntityStatusStore } from './Store';
import { HydratorProps } from './types';

export default function EntityStatusHydrator({
    catalogName,
    children,
}: HydratorProps) {
    const { data, error, mutate } = useEntityStatus(catalogName);

    const hydrated = useEntityStatusStore((state) => state.hydrated);
    const setActive = useEntityStatusStore((state) => state.setActive);
    const setHydrated = useEntityStatusStore((state) => state.setHydrated);
    const setHydrationError = useEntityStatusStore(
        (state) => state.setHydrationError
    );
    const setRefresh = useEntityStatusStore((state) => state.setRefresh);

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
                setActive(false);
                setHydrationError(error);
            }

            setRefresh(mutate);
        }
    }, [
        data,
        error,
        hydrated,
        mutate,
        setActive,
        setHydrated,
        setHydrationError,
        setRefresh,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
