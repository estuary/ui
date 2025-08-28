import type { BaseComponentProps } from 'src/types';

import { useEffect, useRef } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import {
    useEntityWorkflow,
    useEntityWorkflow_Editing,
} from 'src/context/Workflow';
import useTrialPrefixes from 'src/hooks/trialStorage/useTrialPrefixes';
import { logRocketConsole } from 'src/services/shared';
import {
    useBinding_hydrated,
    useBinding_hydrateState,
    useBinding_resetState,
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export const BindingHydrator = ({ children }: BaseComponentProps) => {
    // We want to manually control this in a REF to not fire extra effect calls
    const rehydrating = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const getTrialPrefixes = useTrialPrefixes();

    const connectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const resetState = useBinding_resetState();

    const hydrated = useBinding_hydrated();
    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

    const setPrefilledCapture = useSourceCaptureStore(
        (state) => state.setPrefilledCapture
    );

    useEffect(() => {
        if (
            (workflow && connectorTagId.length > 0) ||
            workflow === 'collection_create'
        ) {
            resetState(false, true);
            setActive(true);

            // TODO (Workflow Hydrator) - when moving bindings into the parent hydrator
            //  make sure that we allow resetting everything in the store except for the bindings
            //  themselves. That way `hydrateState` won't have to call `resetState` with a bunch of flags... hopefully
            hydrateState(
                editWorkflow,
                entityType,
                connectorTagId,
                getTrialPrefixes,
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
                    (error) => {
                        logRocketConsole(
                            'Failed to hydrate binding-dependent views',
                            error
                        );

                        setHydrationErrorsExist(true);
                    }
                )
                .finally(() => {
                    rehydrating.current = true;
                    setHydrated(true);

                    setActive(false);
                });
        }
    }, [
        connectorTagId,
        editWorkflow,
        entityType,
        getTrialPrefixes,
        hydrateState,
        resetState,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setPrefilledCapture,
        workflow,
    ]);

    if (!hydrated) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BindingHydrator;
