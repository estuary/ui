import { useEffect } from 'react';

import { useEntityStatusStore } from './Store';
import { HydratorProps } from './types';
import { useMount } from 'react-use';

import useEntityStatus from 'src/hooks/entityStatus/useEntityStatus';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

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
        if (!hydrated) {
            setActive(true);
        }
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

                logRocketEvent(`${CustomEvents.ENTITY_STATUS}:InitFailed`);
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
