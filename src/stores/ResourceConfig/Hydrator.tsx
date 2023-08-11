import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { BaseComponentProps } from 'types';
import {
    useResourceConfig_hydrated,
    useResourceConfig_hydrateState,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

// Hydrator
interface ResourceConfigHydratorProps extends BaseComponentProps {
    disableAddingCollections?: boolean;
}

export const ResourceConfigHydrator = ({
    children,
}: ResourceConfigHydratorProps) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'materialization_edit' || workflow === 'capture_edit';

    const hydrated = useResourceConfig_hydrated();
    const setHydrated = useResourceConfig_setHydrated();

    const setHydrationErrorsExist = useResourceConfig_setHydrationErrorsExist();

    const hydrateState = useResourceConfig_hydrateState();

    const hydrateTheState = (rehydrating: boolean) => {
        hydrateState(editWorkflow, entityType, rehydrating).then(
            () => {
                setHydrated(true);
            },
            () => {
                setHydrated(true);
                setHydrationErrorsExist(true);
            }
        );
    };

    useEffectOnce(() => {
        if (workflow && !hydrated) {
            hydrateTheState(false);
        }
    });

    useUpdateEffect(() => {
        hydrateTheState(true);
    }, [connectorId]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default ResourceConfigHydrator;
