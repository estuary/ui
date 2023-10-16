import {
    useExistingEntity_hydrated,
    useExistingEntity_hydrateState,
    useExistingEntity_setActive,
    useExistingEntity_setHydrated,
    useExistingEntity_setHydrationErrorsExist,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect } from 'react';
import { BaseComponentProps } from 'types';

function ExistingEntityHydrator({ children }: BaseComponentProps) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
    const entityType = useEntityType();

    const hydrated = useExistingEntity_hydrated();
    const setHydrated = useExistingEntity_setHydrated();
    const setActive = useExistingEntity_setActive();
    const setHydrationErrorsExist = useExistingEntity_setHydrationErrorsExist();

    const hydrateState = useExistingEntity_hydrateState();

    useEffect(() => {
        if (
            !hydrated &&
            connectorId &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            setActive(true);
            hydrateState(entityType, connectorId).then(
                () => {
                    setHydrated(true);
                },
                () => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                }
            );
        }
    }, [
        connectorId,
        entityType,
        hydrateState,
        hydrated,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ExistingEntityHydrator;
