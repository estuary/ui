import { JsonFormsCore } from '@jsonforms/core';
import { useEntityContext } from 'components/shared/Entity/EntityContext';
import {
    DetailsFormStoreNames,
    registerStores,
    useZustandStoreMap,
} from 'context/Zustand';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { ENTITY } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const storeName = (entityType: ENTITY): DetailsFormStoreNames => {
    switch (entityType) {
        case ENTITY.CAPTURE:
            return DetailsFormStoreNames.CAPTURE_CREATE;
        case ENTITY.MATERIALIZATION:
            return DetailsFormStoreNames.MATERIALIZATION_CREATE;
        default: {
            throw new Error('Invalid DetailsForm store name');
        }
    }
};

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage: {
            id: string;
            iconPath: string;
            imagePath: string;
            connectorId: string;
        };
    };
}

export interface DetailsFormState {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;

    detailsFormErrorsExist: boolean;

    // Connectors
    connectors: { [key: string]: any }[];
    setConnectors: (val: DetailsFormState['connectors']) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}

const getInitialStateData = (): Pick<
    DetailsFormState,
    'details' | 'detailsFormErrorsExist' | 'connectors'
> => ({
    details: {
        data: {
            connectorImage: {
                connectorId: '',
                id: '',
                iconPath: '',
                imagePath: '',
            },
            entityName: '',
        },
        errors: [],
    },
    detailsFormErrorsExist: true,

    connectors: [],
});

export const getInitialState = (
    set: NamedSet<DetailsFormState>,
    get: StoreApi<DetailsFormState>['getState']
): DetailsFormState => ({
    ...getInitialStateData(),

    setDetails: (details) => {
        set(
            produce((state: DetailsFormState) => {
                if (details.data.connectorImage.id === '') {
                    state.details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                }

                state.details = details;

                state.detailsFormErrorsExist = !isEmpty(
                    details.errors ?? get().details.errors
                );
            }),
            false,
            'Details Changed'
        );
    },

    setConnectors: (val) => {
        set(
            produce((state: DetailsFormState) => {
                state.connectors = val;
            }),
            false,
            'Connector Response Cached'
        );
    },

    stateChanged: () => {
        const { details } = get();
        const { details: initialDetails } = getInitialStateData();

        return !isEqual(details.data, initialDetails.data);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Details Form State Reset');
    },
});

export const createDetailsFormStore = (key: DetailsFormStoreNames) => {
    return createStore<DetailsFormState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

// Selector hooks
export const useDetailsForm_connectorImage = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(storeName(entityType), (state) => state.details.data.connectorImage);
};

export const useDetailsForm_connectorImage_connectorId = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']['connectorId']
    >(
        storeName(entityType),
        (state) => state.details.data.connectorImage.connectorId
    );
};

export const useDetailsForm_connectorImage_id = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']['id']
    >(storeName(entityType), (state) => state.details.data.connectorImage.id);
};

export const useDetailsForm_details = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']
    >(storeName(entityType), (state) => state.details.data);
};

export const useDetailsForm_details_description = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']['description']
    >(storeName(entityType), (state) => state.details.data.description);
};

export const useDetailsForm_details_entityName = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['details']['data']['entityName']
    >(storeName(entityType), (state) => state.details.data.entityName);
};

export const useDetailsForm_setDetails = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<DetailsFormState, DetailsFormState['setDetails']>(
        storeName(entityType),
        (state) => state.setDetails
    );
};

const errorsExistSelector = (state: DetailsFormState) =>
    state.detailsFormErrorsExist;
export const useDetailsForm_errorsExist = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['detailsFormErrorsExist']
    >(storeName(entityType), errorsExistSelector);
};

export const useDetailsForm_changed = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<
        DetailsFormState,
        DetailsFormState['stateChanged']
    >(storeName(entityType), (state) => state.stateChanged);
};

export const useDetailsForm_resetFormState = () => {
    const entityType = useEntityContext();
    return useZustandStoreMap<DetailsFormState, DetailsFormState['resetState']>(
        storeName(entityType),
        (state) => state.resetState
    );
};

registerStores(
    [storeName(ENTITY.CAPTURE), storeName(ENTITY.MATERIALIZATION)],
    createDetailsFormStore
);
