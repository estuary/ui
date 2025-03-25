import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import useTrialPrefixes from 'hooks/trialStorage/useTrialPrefixes';
import { useEffect, useRef } from 'react';
import { logRocketConsole } from 'services/shared';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import type { BaseComponentProps } from 'types';
import {
    useBinding_hydrateState,
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from './hooks';

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
            setActive(true);
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
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setPrefilledCapture,
        workflow,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BindingHydrator;
