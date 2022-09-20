import { useEntityType } from 'context/EntityContext';
import {
    EndpointConfigStoreNames,
    registerStores,
    useZustandStoreMap,
} from 'context/Zustand';
import produce from 'immer';
import { isEmpty, isEqual, map } from 'lodash';
import { ENTITY, JsonFormsData, Schema } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const storeName = (entityType: ENTITY): EndpointConfigStoreNames => {
    switch (entityType) {
        case ENTITY.CAPTURE:
            return EndpointConfigStoreNames.CAPTURE;
        case ENTITY.MATERIALIZATION:
            return EndpointConfigStoreNames.MATERIALIZATION;
        default: {
            throw new Error('Invalid EndpointConfig store name');
        }
    }
};

export interface EndpointConfigState {
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: (string | undefined)[];

    endpointSchema: Schema;
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}

const fetchErrors = ({ errors }: JsonFormsData): JsonFormsData['errors'] => {
    let response: JsonFormsData['errors'] = [];

    if (errors && errors.length > 0) {
        response = response.concat(errors);
    }

    return response;
};

const filterErrors = (list: JsonFormsData['errors']): (string | undefined)[] =>
    map(list, 'message');

const populateEndpointConfigErrors = (
    endpointConfig: JsonFormsData,
    state: EndpointConfigState
): void => {
    const endpointConfigErrors = filterErrors(fetchErrors(endpointConfig));

    state.endpointConfigErrors = endpointConfigErrors;
    state.endpointConfigErrorsExist = !isEmpty(endpointConfigErrors);
};

const getInitialStateData = (): Pick<
    EndpointConfigState,
    | 'endpointConfig'
    | 'endpointConfigErrorsExist'
    | 'endpointConfigErrors'
    | 'endpointSchema'
> => ({
    endpointConfig: { data: {}, errors: [] },
    endpointConfigErrorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
});

const getInitialState = (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState']
): EndpointConfigState => ({
    ...getInitialStateData(),

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state) => {
                state.endpointConfig = endpointConfig;
                populateEndpointConfigErrors(endpointConfig, state);
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setEndpointSchema: (val) => {
        set(
            produce((state) => {
                state.endpointSchema = val;
            }),
            false,
            'Endpoint Schema Set'
        );
    },

    stateChanged: () => {
        const { endpointConfig } = get();
        const { endpointConfig: initialEndpointConfig } = getInitialStateData();

        return !isEqual(endpointConfig.data, initialEndpointConfig.data);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Endpoint Config State Reset');
    },
});

export const createEndpointConfigStore = (key: EndpointConfigStoreNames) => {
    return createStore<EndpointConfigState>()(
        devtools(getInitialState, devtoolsOptions(key))
    );
};

export const useEndpointConfigStore_errorsExist = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(storeName(entityType), (state) => state.endpointConfigErrorsExist);
};

export const useEndpointConfigStore_reset = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(storeName(entityType), (state) => state.resetState);
};

export const useEndpointConfigStore_changed = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(storeName(entityType), (state) => state.stateChanged);
};

export const useEndpointConfigStore_endpointSchema = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(storeName(entityType), (state) => state.endpointSchema);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['setEndpointSchema']
    >(storeName(entityType), (state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_endpointConfig_data = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(storeName(entityType), (state) => state.endpointConfig.data);
};

export const useEndpointConfigStore_setEndpointConfig = () => {
    const entityType = useEntityType();
    return useZustandStoreMap<
        EndpointConfigState,
        EndpointConfigState['setEndpointConfig']
    >(storeName(entityType), (state) => state.setEndpointConfig);
};

registerStores(
    [storeName(ENTITY.CAPTURE), storeName(ENTITY.MATERIALIZATION)],
    createEndpointConfigStore
);
