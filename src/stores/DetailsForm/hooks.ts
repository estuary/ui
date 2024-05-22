import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { DetailsFormState } from 'stores/DetailsForm/types';
import { DetailsFormStoreNames } from 'stores/names';
import { Entity } from 'types';

export const getStoreName = (entityType: Entity): DetailsFormStoreNames => {
    switch (entityType) {
        case 'capture':
            return DetailsFormStoreNames.CAPTURE;
        case 'materialization':
            return DetailsFormStoreNames.MATERIALIZATION;
        case 'collection':
            return DetailsFormStoreNames.COLLECTION;
        default: {
            throw new Error('Invalid DetailsForm store name');
        }
    }
};

// Selector hooks
export const useDetailsForm_changed_connectorId = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, boolean>(
        getStoreName(entityType),
        (state) =>
            state.details.data.connectorImage.connectorId !==
                state.previousDetails.data.connectorImage.connectorId ||
            Boolean(
                connectorId &&
                    connectorId !==
                        state.details.data.connectorImage.connectorId
            )
    );
};

export const useDetailsForm_customErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['customErrors']>(
        getStoreName(entityType),
        (state) => state.customErrors
    );
};

export const useDetailsForm_resetState = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['resetState']>(
        getStoreName(entityType),
        (state) => state.resetState
    );
};
