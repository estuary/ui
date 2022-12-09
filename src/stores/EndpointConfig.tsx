import { getLiveSpecsByLiveSpecId, getSchema_Endpoint } from 'api/hydration';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual, map } from 'lodash';
import LogRocket from 'logrocket';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { createJSONFormDefaults } from 'services/ajv';
import { processSchemaForRendering } from 'services/jsonforms';
import {
    Entity,
    EntityWithCreateWorkflow,
    EntityWorkflow,
    JsonFormsData,
    Schema,
} from 'types';
import useConstant from 'use-constant';
import { parseEncryptedEndpointConfig } from 'utils/sops-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi, useStore } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { getStoreWithHydrationSettings, StoreWithHydration } from './Hydration';
import { EndpointConfigStoreNames } from './names';

export interface EndpointConfigState extends StoreWithHydration {
    endpointSchema: Schema;
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;

    // Used to display custom errors in JsonForms
    endpointCustomErrors: any[];
    setEndpointCustomErrors: (
        val: EndpointConfigState['endpointCustomErrors']
    ) => void;

    // Encrypted Endpoint Configs
    publishedEndpointConfig: JsonFormsData;
    setPublishedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['publishedEndpointConfig']
    ) => void;

    encryptedEndpointConfig: JsonFormsData;
    setEncryptedEndpointConfig: (
        encryptedEndpointConfig: EndpointConfigState['encryptedEndpointConfig']
    ) => void;

    // JSON Form Compatible-Endpoint Configs
    previousEndpointConfig: JsonFormsData;
    setPreviousEndpointConfig: (
        endpointConfig: EndpointConfigState['previousEndpointConfig']
    ) => void;

    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: { message: string | undefined }[];

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

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
    endpointCustomErrors: any[],
    state: EndpointConfigState
): void => {
    const endpointConfigErrors = filterErrors(fetchErrors(endpointConfig));

    state.endpointConfigErrors = endpointConfigErrors.map((message) => ({
        message,
    }));

    state.endpointConfigErrorsExist = !state.serverUpdateRequired
        ? false
        : !isEmpty(endpointConfigErrors) || !isEmpty(endpointCustomErrors);
};

const getInitialStateData = (
    workflow?: EntityWorkflow
): Pick<
    EndpointConfigState,
    | 'encryptedEndpointConfig'
    | 'endpointConfig'
    | 'endpointConfigErrorsExist'
    | 'endpointConfigErrors'
    | 'endpointSchema'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'previousEndpointConfig'
    | 'publishedEndpointConfig'
    | 'serverUpdateRequired'
    | 'endpointCustomErrors'
> => ({
    encryptedEndpointConfig: { data: {}, errors: [] },
    endpointConfig: { data: {}, errors: [] },
    endpointConfigErrorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
    hydrated: false,
    hydrationErrorsExist: false,
    previousEndpointConfig: { data: {}, errors: [] },
    publishedEndpointConfig: { data: {}, errors: [] },
    endpointCustomErrors: [],
    serverUpdateRequired:
        workflow === 'capture_create' || workflow === 'materialization_create',
});

const hydrateState = async (
    get: StoreApi<EndpointConfigState>['getState'],
    entityType: EntityWithCreateWorkflow
): Promise<void> => {
    const searchParams = new URLSearchParams(window.location.search);
    const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
    const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

    if (connectorId) {
        const { data, error } = await getSchema_Endpoint(connectorId);

        if (error) {
            const { setHydrationErrorsExist } = get();

            setHydrationErrorsExist(true);
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
            const { setHydrationErrorsExist } = get();

            setHydrationErrorsExist(true);
        }

        if (data && data.length > 0) {
            const {
                setEncryptedEndpointConfig,
                setEndpointConfig,
                setPreviousEndpointConfig,
                setPublishedEndpointConfig,
                endpointSchema,
            } = get();

            const encryptedEndpointConfig =
                data[0].spec.endpoint.connector.config;

            setEncryptedEndpointConfig({ data: encryptedEndpointConfig });

            setPublishedEndpointConfig({ data: encryptedEndpointConfig });

            const endpointConfig = parseEncryptedEndpointConfig(
                encryptedEndpointConfig,
                endpointSchema
            );

            setPreviousEndpointConfig(endpointConfig);

            setEndpointConfig(endpointConfig);
        }
    }
};

const getInitialState = (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState'],
    workflow: EntityWorkflow
): EndpointConfigState => ({
    ...getInitialStateData(workflow),
    ...getStoreWithHydrationSettings('Endpoint Config', set),

    setEndpointCustomErrors: (val) => {
        set(
            produce((state) => {
                state.endpointCustomErrors = val;
            }),
            false,
            'Endpoint Custom Errors Set'
        );
    },

    setEndpointSchema: (val) => {
        set(
            produce((state) => {
                state.endpointSchema = processSchemaForRendering(val);
            }),
            false,
            'Endpoint Schema Set'
        );
    },

    setPublishedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema } = get();

                state.publishedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : encryptedEndpointConfig;
            }),
            false,
            'Published Endpoint Config Set'
        );
    },

    setEncryptedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema, endpointCustomErrors } = get();

                state.encryptedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : encryptedEndpointConfig;

                populateEndpointConfigErrors(
                    encryptedEndpointConfig,
                    endpointCustomErrors,
                    state
                );
            }),
            false,
            'Encrypted Endpoint Config Set'
        );
    },

    setPreviousEndpointConfig: (endpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema } = get();

                state.previousEndpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : endpointConfig;
            }),
            false,
            'Previous Endpoint Config Changed'
        );
    },

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema, endpointCustomErrors } = get();

                state.endpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : endpointConfig;

                populateEndpointConfigErrors(
                    endpointConfig,
                    endpointCustomErrors,
                    state
                );
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setServerUpdateRequired: (updateRequired) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointConfig, endpointCustomErrors } = get();

                state.serverUpdateRequired = updateRequired;

                populateEndpointConfigErrors(
                    endpointConfig,
                    endpointCustomErrors,
                    state
                );
            }),
            false,
            'Server Update Required Flag Changed'
        );
    },

    stateChanged: () => {
        const { encryptedEndpointConfig, publishedEndpointConfig } = get();

        return !isEqual(encryptedEndpointConfig, publishedEndpointConfig);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Endpoint Config State Reset');
    },
});

// TODO (research): Investigate the differences between createStore() and create().
export const createHydratedEndpointConfigStore = (
    key: EndpointConfigStoreNames,
    entityType: Entity,
    workflow: EntityWorkflow
) => {
    return createStore<EndpointConfigState>()(
        devtools((set, get) => {
            const coreState = getInitialState(set, get, workflow);

            if (entityType === 'capture' || entityType === 'materialization') {
                hydrateState(get, entityType).then(
                    () => {
                        const { setHydrated } = get();

                        setHydrated(true);
                    },
                    (error: any) => {
                        LogRocket.log(
                            'Failed to hydrate endpoint config',
                            error
                        );

                        const { setHydrated, setHydrationErrorsExist } = get();

                        setHydrated(true);

                        setHydrationErrorsExist(true);
                    }
                );
            }

            return coreState;
        }, devtoolsOptions(key))
    );
};

// Context Provider
interface EndpointConfigProviderProps {
    children: ReactNode;
}

const invariableStore = {
    [EndpointConfigStoreNames.GENERAL]: {},
};

export const EndpointConfigContext = createReactContext<any | null>(null);

export const EndpointConfigProvider = ({
    children,
}: EndpointConfigProviderProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const storeOptions = useConstant(() => {
        invariableStore[EndpointConfigStoreNames.GENERAL] = workflow
            ? createHydratedEndpointConfigStore(
                  EndpointConfigStoreNames.GENERAL,
                  entityType,
                  workflow
              )
            : {};

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
const getStoreName = (entityType: Entity): EndpointConfigStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
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

export const useEndpointConfigStore_endpointConfigErrors = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrors']
    >(getStoreName(entityType), (state) => state.endpointConfigErrors);
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

export const useEndpointConfigStore_endpointCustomErrors = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['endpointCustomErrors']
    >(getStoreName(entityType), (state) => state.endpointCustomErrors);
};

export const useEndpointConfigStore_setEndpointCustomErrors = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointCustomErrors']
    >(getStoreName(entityType), (state) => state.setEndpointCustomErrors);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointSchema']
    >(getStoreName(entityType), (state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_encryptedEndpointConfig_data = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['encryptedEndpointConfig']['data']
    >(getStoreName(entityType), (state) => state.encryptedEndpointConfig.data);
};

export const useEndpointConfigStore_setEncryptedEndpointConfig = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setEncryptedEndpointConfig']
    >(getStoreName(entityType), (state) => state.setEncryptedEndpointConfig);
};

export const useEndpointConfigStore_previousEndpointConfig_data = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['previousEndpointConfig']['data']
    >(getStoreName(entityType), (state) => state.previousEndpointConfig.data);
};

export const useEndpointConfigStore_setPreviousEndpointConfig = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setPreviousEndpointConfig']
    >(getStoreName(entityType), (state) => state.setPreviousEndpointConfig);
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

export const useEndpointConfig_hydrated = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['hydrated']
    >(getStoreName(entityType), (state) => state.hydrated);
};

export const useEndpointConfig_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['hydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.hydrationErrorsExist);
};

export const useEndpointConfig_serverUpdateRequired = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['serverUpdateRequired']
    >(getStoreName(entityType), (state) => state.serverUpdateRequired);
};

export const useEndpointConfig_setServerUpdateRequired = () => {
    const entityType = useEntityType();

    return useEndpointConfigStore<
        EndpointConfigState,
        EndpointConfigState['setServerUpdateRequired']
    >(getStoreName(entityType), (state) => state.setServerUpdateRequired);
};
