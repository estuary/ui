import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';
import { useEffect, useRef } from 'react';

import { useDetailsForm_connectorImage_id } from 'stores/DetailsForm/hooks';
import { BaseComponentProps } from 'types';
import { useStore } from 'zustand';
import {
    useResourceConfig_hydrateState,
    useResourceConfig_setActive,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

export const ResourceConfigHydrator = ({ children }: BaseComponentProps) => {
    // We want to manually control this in a REF to not fire extra effect calls
    const rehydrating = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const connectorTagId = useDetailsForm_connectorImage_id();

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

    useEffect(() => {
        if (workflow && connectorTagId.length > 0) {
            setActive(true);
            hydrateState(
                editWorkflow,
                entityType,
                connectorTagId,
                rehydrating.current
            )
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
                    rehydrating.current = true;
                    setHydrated(true);
                });
        }
    }, [
        connectorTagId,
        editWorkflow,
        entityType,
        hydrateState,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setPrefilledCapture,
        workflow,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default ResourceConfigHydrator;
