import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { BaseComponentProps } from 'types';
import { useStore } from 'zustand';
import {
    useResourceConfig_hydrated,
    useResourceConfig_hydrateState,
    useResourceConfig_setActive,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

export const ResourceConfigHydrator = ({ children }: BaseComponentProps) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'materialization_edit' || workflow === 'capture_edit';

    const hydrated = useResourceConfig_hydrated();
    const setHydrated = useResourceConfig_setHydrated();
    const setActive = useResourceConfig_setActive();
    const setHydrationErrorsExist = useResourceConfig_setHydrationErrorsExist();
    const hydrateState = useResourceConfig_hydrateState();

    const setPrefilledCapture = useStore(
        invariableStores['source-capture'],
        (state) => {
            return state.setPrefilledCapture;
        }
    );

    const hydrateTheState = (rehydrating: boolean) => {
        setActive(true);
        hydrateState(editWorkflow, entityType, rehydrating).then(
            (response) => {
                if (response && response.length === 1) {
                    setPrefilledCapture(response[0].catalog_name);
                }

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
