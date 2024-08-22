import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import { useEffect, useRef } from 'react';
import { useConnectorStore } from 'stores/Connector/Store';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { BaseComponentProps } from 'types';
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

    const [resourceSchema, connector_hydrated] = useConnectorStore((state) => [
        state.tag?.resource_spec_schema,
        state.hydrated,
    ]);

    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

    const setPrefilledCapture = useSourceCaptureStore(
        (state) => state.setPrefilledCapture
    );

    useEffect(() => {
        if ((workflow && resourceSchema) || workflow === 'collection_create') {
            setActive(true);
            hydrateState(
                editWorkflow,
                entityType,
                resourceSchema,
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

                    setActive(false);
                });
        } else if (connector_hydrated && !resourceSchema) {
            setHydrated(true);
            setHydrationErrorsExist(true);
        }
    }, [
        connector_hydrated,
        editWorkflow,
        entityType,
        hydrateState,
        resourceSchema,
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
