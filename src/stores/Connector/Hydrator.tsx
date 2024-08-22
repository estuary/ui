import { useEffect, useState } from 'react';
import { useUnmount } from 'react-use';
import { logRocketConsole } from 'services/shared';
import { useConnectorStore } from 'stores/Connector/Store';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';

import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

export const ConnectorHydrator = ({ children }: BaseComponentProps) => {
    const [runHydration, setRunHydration] = useState(true);

    const connectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );

    const [hydrated, setHydrated, hydrateState, setActive, resetState] =
        useConnectorStore((state) => [
            state.hydrated,
            state.setHydrated,
            state.hydrateState,
            state.setActive,
            state.resetState,
        ]);

    useEffect(() => {
        setRunHydration(true);
        setHydrated(false);
    }, [connectorId, setHydrated]);

    useEffect(() => {
        if (!runHydration || hydrated || !hasLength(connectorId)) {
            return;
        }

        setRunHydration(false);
        setActive(true);
        hydrateState(connectorId)
            .then(
                () => {
                    // No special handling needed
                },
                (error) => {
                    logRocketConsole(
                        'Failed to hydrate connector details',
                        error
                    );
                }
            )
            .finally(() => {
                setHydrated(true);
            });
    }, [
        connectorId,
        hydrateState,
        hydrated,
        runHydration,
        setActive,
        setHydrated,
    ]);

    useUnmount(() => resetState());

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
