import type { LiveSpecsExt_MaterializeOrTransform } from 'src/hooks/useLiveSpecsExt';
import type { BaseComponentProps } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import { useConnectorTag_nullable } from 'src/context/ConnectorTag';
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
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from 'src/stores/Binding/hooks';
import { PrefillSourceCaptureGate } from 'src/stores/Binding/PrefillSourceCaptureGate';

export const BindingHydrator = ({ children }: BaseComponentProps) => {
    // We want to manually control this in a REF to not fire extra effect calls
    const rehydrating = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const getTrialPrefixes = useTrialPrefixes();

    const connectorTagState = useConnectorTag_nullable();

    const hydrated = useBinding_hydrated();
    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

    const [prefillResponse, setPrefillResponse] =
        useState<LiveSpecsExt_MaterializeOrTransform[] | null>(null);

    useEffect(() => {
        if (workflow && connectorTagState) {
            const connectorTag = connectorTagState.applicable
                ? connectorTagState.data
                : null;

            setActive(true);

            // TODO (Workflow Hydrator) - when moving bindings into the parent hydrator
            //  make sure that we allow resetting everything in the store except for the bindings
            //  themselves. That way `hydrateState` won't have to call `resetState` with a bunch of flags... hopefully
            hydrateState(
                editWorkflow,
                entityType,
                connectorTag,
                getTrialPrefixes,
                rehydrating.current
            )
                .then(
                    (response) => {
                        setPrefillResponse(response ?? null);
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
        connectorTagState,
        editWorkflow,
        entityType,
        getTrialPrefixes,
        hydrateState,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        workflow,
    ]);

    if (!hydrated) {
        return null;
    }

    return (
        <PrefillSourceCaptureGate response={prefillResponse}>
            {children}
        </PrefillSourceCaptureGate>
    );
};

export default BindingHydrator;
