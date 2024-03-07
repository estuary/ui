import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';

import { useEffectOnce, useUpdateEffect } from 'react-use';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
} from 'stores/DetailsForm/hooks';
import { BaseComponentProps } from 'types';
import { useStore } from 'zustand';
import {
    useResourceConfig_hydrateState,
    useResourceConfig_hydrated,
    useResourceConfig_setActive,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

export const ResourceConfigHydrator = ({ children }: BaseComponentProps) => {
    const connectorId = useDetailsForm_connectorImage_connectorId();
    const connectorTagId = useDetailsForm_connectorImage_id();

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

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
        hydrateState(
            editWorkflow,
            entityType,
            connectorId,
            connectorTagId,
            rehydrating
        ).then(
            (response) => {
                if (
                    response &&
                    response.length === 1 &&
                    response[0].spec_type === 'capture' &&
                    !editWorkflow
                ) {
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
        if (connectorId.length > 0 && connectorTagId.length > 0) {
            hydrateTheState(true);
        }
    }, [connectorId, connectorTagId]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default ResourceConfigHydrator;
