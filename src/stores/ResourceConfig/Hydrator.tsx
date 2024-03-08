import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';
import { useRef } from 'react';

import { useUpdateEffect } from 'react-use';
import { useDetailsForm_connectorImage_id } from 'stores/DetailsForm/hooks';
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
    // We want to make sure we only start firing the initial hydrator once
    //  Then after that we only want to run the "udpater" when the connector tag changes
    const runUpdates = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const connectorTagId = useDetailsForm_connectorImage_id();

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
        hydrateState(editWorkflow, entityType, connectorTagId, rehydrating)
            .then(
                (response) => {
                    if (
                        response &&
                        response.length === 1 &&
                        response[0].spec_type === 'capture' &&
                        !editWorkflow
                    ) {
                        setPrefilledCapture(response[0].catalog_name);
                    }
                },
                () => {
                    setHydrationErrorsExist(true);
                }
            )
            .finally(() => {
                runUpdates.current = true;
                setHydrated(true);
            });
    };

    useUpdateEffect(() => {
        if (
            workflow &&
            connectorTagId.length > 0 &&
            !hydrated &&
            !runUpdates.current
        ) {
            hydrateTheState(false);
        }
    }, [connectorTagId.length, hydrated, workflow]);

    useUpdateEffect(() => {
        if (runUpdates.current) {
            hydrateTheState(true);
        }
    }, [connectorTagId]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default ResourceConfigHydrator;
