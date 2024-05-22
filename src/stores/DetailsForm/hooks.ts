import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { DetailsFormStoreNames } from 'stores/names';
import { Entity } from 'types';
import { useDetailsFormStore } from './Store';

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

    return useDetailsFormStore(
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
