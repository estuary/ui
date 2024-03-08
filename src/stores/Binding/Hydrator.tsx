import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow, useEntityWorkflow_Editing } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { useDetailsForm_connectorImage_id } from 'stores/DetailsForm/hooks';
import { BaseComponentProps } from 'types';
import { useStore } from 'zustand';
import {
    useBinding_hydrateState,
    useBinding_hydrated,
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from './hooks';

export const BindingHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const connectorTagId = useDetailsForm_connectorImage_id();

    const hydrated = useBinding_hydrated();
    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

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

                    setHydrated(true);
                },
                () => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                }
            )
            .finally(() => {
                setActive(false);
            });
    };

    useEffectOnce(() => {
        if (workflow && !hydrated) {
            hydrateTheState(false);
        }
    });

    useUpdateEffect(() => {
        hydrateTheState(true);
    }, [connectorTagId]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BindingHydrator;
