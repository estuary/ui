import { useEntityType } from 'context/EntityContext';
import { EndpointConfigStoreNames } from 'context/Zustand';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual, map } from 'lodash';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { createJSONFormDefaults } from 'services/ajv';
import {
    getEndpointSchema,
    getLiveSpecsByLiveSpecId,
} from 'stores/api/hydration';
import { ENTITY, EntityWithCreateWorkflow, JsonFormsData, Schema } from 'types';
import useConstant from 'use-constant';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi, useStore } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface EndpointConfigState {
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: (string | undefined)[];

    endpointSchema: Schema;
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;

    // Hydration
    hydrated: boolean;
    hydrationErrorsExist: boolean;

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
    | 'hydrated'
    | 'hydrationErrorsExist'
> => ({
    endpointConfig: { data: {}, errors: [] },
    endpointConfigErrorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
    hydrated: false,
    hydrationErrorsExist: false,
});

const hydrateState = async (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState'],
    entityType: EntityWithCreateWorkflow
): Promise<void> => {
    const searchParams = new URLSearchParams(window.location.search);
    const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
    const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

    if (connectorId) {
        const { data, error } = await getEndpointSchema(connectorId);

        if (error) {
            set(
                produce((state: EndpointConfigState) => {
                    state.hydrationErrorsExist = true;
                }),
                false,
                'Endpoint Config Hydration Errors Detected'
            );
        }

        if (data && data.length > 0) {
            const { setEndpointSchema } = get();

            setEndpointSchema(
                data[0].endpoint_spec_schema as unknown as Schema
            );
        }
    }

    if (liveSpecId) {
        const { data, error } = await getLiveSpecsByLiveSpecId(
            liveSpecId,
            entityType
        );

        if (error) {
            set(
                produce((state: EndpointConfigState) => {
                    state.hydrationErrorsExist = true;
                }),
                false,
                'Endpoint Config Hydration Errors Detected'
            );
        }

        if (data && data.length > 0) {
            const { setEndpointConfig } = get();

            setEndpointConfig({ data: data[0].spec.endpoint.connector.config });
        }
    }
};

const getInitialState = (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState']
): EndpointConfigState => ({
    ...getInitialStateData(),

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state) => {
                const { endpointSchema } = get();

                state.endpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : endpointConfig;

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

// TODO (research): Investigate the differences between createStore() and create().
export const createHydratedEndpointConfigStore = (
    key: EndpointConfigStoreNames,
    entityType: EntityWithCreateWorkflow
) => {
    return createStore<EndpointConfigState>()(
        devtools((set, get) => {
            const coreState = getInitialState(set, get);

            hydrateState(set, get, entityType).then(
                () => {
                    set(
                        produce((state: EndpointConfigState) => {
                            state.hydrated = true;
                        }),
                        false,
                        'Endpoint Config State Hydrated'
                    );
                },
                () => {
                    set(
                        produce((state: EndpointConfigState) => {
                            state.hydrated = true;

                            state.hydrationErrorsExist = true;
                        }),
                        false,
                        'Endpoint Config Hydration Errors Detected'
                    );
                }
            );

            return coreState;
        }, devtoolsOptions(key))
    );
};

// Context Provider
interface EndpointConfigProviderProps {
    children: ReactNode;
    entityType: EntityWithCreateWorkflow;
}

const invariableStore = {
    [EndpointConfigStoreNames.GENERAL]: {},
};

export const EndpointConfigContext = createReactContext<any | null>(null);

export const EndpointConfigProvider = ({
    children,
    entityType,
}: EndpointConfigProviderProps) => {
    const storeOptions = useConstant(() => {
        invariableStore[EndpointConfigStoreNames.GENERAL] =
            createHydratedEndpointConfigStore(
                EndpointConfigStoreNames.GENERAL,
                entityType
            );

        return invariableStore;
    });

    return (
        <EndpointConfigContext.Provider value={storeOptions}>
            {children}
        </EndpointConfigContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
const useEndpointConfigStore = <S extends Object, U>(
    storeName: EndpointConfigStoreNames,
    selector: (state: S) => U,
    equalityFn?: any
) => {
    const storeOptions = useContext(EndpointConfigContext);
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};

// Selector Hooks
const getStoreName = (entityType: ENTITY): EndpointConfigStoreNames => {
    if (
        entityType === ENTITY.CAPTURE ||
        entityType === ENTITY.MATERIALIZATION
    ) {
        return EndpointConfigStoreNames.GENERAL;
    } else {
        throw new Error('Invalid EndpointConfig store name');
    }
};

export const useEndpointConfigStore_errorsExist = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(getStoreName(entityType), (state) => state.endpointConfigErrorsExist);
};

export const useEndpointConfigStore_reset = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};

export const useEndpointConfigStore_changed = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(getStoreName(entityType), (state) => state.stateChanged);
};

export const useEndpointConfigStore_endpointSchema = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(getStoreName(entityType), (state) => state.endpointSchema);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointSchema']
    >(getStoreName(entityType), (state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_endpointConfig_data = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(getStoreName(entityType), (state) => state.endpointConfig.data);
};

export const useEndpointConfigStore_setEndpointConfig = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointConfig']
    >(getStoreName(entityType), (state) => state.setEndpointConfig);
};
