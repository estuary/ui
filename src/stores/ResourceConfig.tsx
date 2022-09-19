import { PostgrestError } from '@supabase/postgrest-js';
import {
    getLiveSpecsByLastPubId,
    getLiveSpecsByLiveSpecId,
    getResourceSchema,
} from 'api/hydration';
import { useEntityType } from 'context/EntityContext';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit } from 'lodash';
import {
    createContext as createReactContext,
    ReactNode,
    useContext,
} from 'react';
import { createJSONFormDefaults } from 'services/ajv';
import { ENTITY, EntityWorkflow, JsonFormsData, Schema } from 'types';
import useConstant from 'use-constant';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi, useStore } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import shallow from 'zustand/shallow';

export interface ResourceConfig {
    [key: string]: JsonFormsData | any[];
    errors: any[];
}

export interface ResourceConfigDictionary {
    [key: string]: ResourceConfig;
}

type HydrationError =
    | PostgrestError
    | Pick<PostgrestError, 'message' | 'details'>;

// TODO (naming): Determine whether the resourceConfig state property should be made plural.
//   It is a dictionary of individual resource configs, so I am leaning "yes."
export interface ResourceConfigState {
    // Collection Selector
    collections: string[] | null;
    preFillEmptyCollections: (collections: LiveSpecsExtQuery[]) => void;
    preFillCollections: (liveSpecsData: LiveSpecsExtQuery[]) => void;

    collectionErrorsExist: boolean;

    currentCollection: string | null;
    setCurrentCollection: (collections: string | null) => void;

    // Resource Config
    resourceConfig: ResourceConfigDictionary;
    setResourceConfig: (
        key: string | [string],
        resourceConfig?: ResourceConfig
    ) => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

    // Resource Schema
    resourceSchema: Schema;
    setResourceSchema: (val: ResourceConfigState['resourceSchema']) => void;

    // Hydration
    // TODO: Narrow the type of hydration errors.
    hydrated: boolean;
    hydrationErrorsExist: boolean;
    hydrationErrors: HydrationError[];

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}

const populateResourceConfigErrors = (
    resourceConfig: ResourceConfigDictionary,
    state: ResourceConfigState
): void => {
    let resourceConfigErrors: any[] = [];

    if (Object.keys(resourceConfig).length > 0) {
        map(resourceConfig, (config) => {
            const { errors } = config;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (errors && errors.length > 0) {
                resourceConfigErrors = resourceConfigErrors.concat(errors);
            }
        });
    } else {
        // TODO (errors) Need to populate this object with something?
        resourceConfigErrors = [{}];
    }

    state.resourceConfigErrors = resourceConfigErrors;
    state.resourceConfigErrorsExist = !isEmpty(resourceConfigErrors);
};

const whatChanged = (
    newResourceKeys: ResourceConfigState['collections'],
    resourceConfig: ResourceConfigDictionary
) => {
    const currentCollections = Object.keys(resourceConfig);

    const removedCollections = difference(
        currentCollections,
        newResourceKeys ?? []
    );

    const newCollections = difference(newResourceKeys, currentCollections);

    return [removedCollections, newCollections];
};

const getInitialStateData = (): Pick<
    ResourceConfigState,
    | 'collections'
    | 'collectionErrorsExist'
    | 'currentCollection'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'hydrationErrors'
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
> => ({
    collections: [],
    collectionErrorsExist: true,
    currentCollection: null,
    hydrated: false,
    hydrationErrorsExist: false,
    hydrationErrors: [],
    resourceConfig: {},
    resourceConfigErrorsExist: true,
    resourceConfigErrors: [],
    resourceSchema: {},
});

const hydrateState = async (
    set: NamedSet<ResourceConfigState>,
    get: StoreApi<ResourceConfigState>['getState'],
    workflow: EntityWorkflow
): Promise<void> => {
    const searchParams = new URLSearchParams(window.location.search);
    const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
    const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);
    const lastPubId = searchParams.get(GlobalSearchParams.LAST_PUB_ID);

    if (connectorId) {
        const { data, error } = await getResourceSchema(connectorId);

        if (error) {
            set(
                produce((state: ResourceConfigState) => {
                    state.hydrationErrorsExist = true;
                    state.hydrationErrors = [...state.hydrationErrors, error];
                }),
                false,
                'Resource Config Hydration Errors Detected'
            );
        }

        if (data && data.length > 0) {
            const { setResourceSchema } = get();

            setResourceSchema(
                data[0].resource_spec_schema as unknown as Schema
            );
        }
    }

    if (workflow === 'materialization_create') {
        const specType = ENTITY.CAPTURE;

        if (lastPubId) {
            const { data, error } = await getLiveSpecsByLastPubId(
                lastPubId,
                specType
            );

            if (error) {
                set(
                    produce((state: ResourceConfigState) => {
                        state.hydrationErrorsExist = true;
                        state.hydrationErrors = [
                            ...state.hydrationErrors,
                            error,
                        ];
                    }),
                    false,
                    'Resource Config Hydration Errors Detected'
                );
            }

            if (data && data.length > 0) {
                const { preFillEmptyCollections } = get();

                preFillEmptyCollections(data);
            }
        } else if (liveSpecId) {
            const { data, error } = await getLiveSpecsByLiveSpecId(
                liveSpecId,
                specType
            );

            if (error) {
                set(
                    produce((state: ResourceConfigState) => {
                        state.hydrationErrorsExist = true;
                        state.hydrationErrors = [
                            ...state.hydrationErrors,
                            error,
                        ];
                    }),
                    false,
                    'Resource Config Hydration Errors Detected'
                );
            }

            if (data && data.length > 0) {
                const { preFillEmptyCollections } = get();

                preFillEmptyCollections(data);
            }
        }
    } else if (workflow === 'materialization_edit' && liveSpecId) {
        const { data, error } = await getLiveSpecsByLiveSpecId(
            liveSpecId,
            ENTITY.MATERIALIZATION
        );

        if (error) {
            set(
                produce((state: ResourceConfigState) => {
                    state.hydrationErrorsExist = true;
                    state.hydrationErrors = [...state.hydrationErrors, error];
                }),
                false,
                'Resource Config Hydration Errors Detected'
            );
        }

        if (data && data.length > 0) {
            const { setResourceConfig, preFillCollections } = get();

            data[0].spec.bindings.forEach((binding: any) =>
                setResourceConfig(binding.source, {
                    data: binding.resource,
                    errors: [],
                })
            );

            preFillCollections(data);
        }
    }
};

const getInitialState = (
    set: NamedSet<ResourceConfigState>,
    get: StoreApi<ResourceConfigState>['getState']
): ResourceConfigState => ({
    ...getInitialStateData(),

    preFillEmptyCollections: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const collections: string[] = [];
                const configs = {};
                const { resourceSchema } = get();

                value.forEach((collection) => {
                    collection.writes_to.forEach((writes_to) => {
                        collections.push(writes_to);
                        configs[writes_to] =
                            createJSONFormDefaults(resourceSchema);
                    });
                });

                state.collections = collections;
                state.currentCollection = collections[0];

                state.resourceConfig = configs;

                populateResourceConfigErrors(configs, state);

                state.collectionErrorsExist = isEmpty(collections);
            }),
            false,
            'Collections Pre-filled'
        );
    },

    preFillCollections: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const collections: string[] = [];

                value.forEach((queryData) => {
                    queryData.reads_from.forEach((collection) => {
                        collections.push(collection);
                    });
                });

                state.collections = collections;
                state.currentCollection = collections[0];

                state.collectionErrorsExist = isEmpty(collections);
            }),
            false,
            'Collections Pre-filled'
        );
    },

    setCurrentCollection: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                state.currentCollection = value;
            }),
            false,
            'Current Collection Changed'
        );
    },

    setResourceConfig: (key, value) => {
        set(
            produce((state: ResourceConfigState) => {
                const { resourceSchema } = get();

                if (typeof key === 'string') {
                    state.resourceConfig[key] =
                        value ?? createJSONFormDefaults(resourceSchema);

                    populateResourceConfigErrors(state.resourceConfig, state);
                } else {
                    const newResourceKeyList = key;
                    const [removedCollections, newCollections] = whatChanged(
                        newResourceKeyList,
                        state.resourceConfig
                    );

                    // Set defaults on new configs
                    newCollections.forEach((element) => {
                        state.resourceConfig[element] =
                            createJSONFormDefaults(resourceSchema);
                    });

                    // Remove any configs that are no longer needed
                    const newResourceConfig = omit(
                        state.resourceConfig,
                        removedCollections
                    );
                    state.resourceConfig = newResourceConfig;

                    // If previous state had no collections set to first
                    // If selected item is removed set to first.
                    // If adding new ones set to last
                    if (
                        (state.collections && state.collections.length === 0) ||
                        (state.currentCollection &&
                            !has(state.resourceConfig, state.currentCollection))
                    ) {
                        state.currentCollection = newResourceKeyList[0];
                    } else {
                        state.currentCollection =
                            newResourceKeyList[newResourceKeyList.length - 1];
                    }

                    // Update the collections with the new array
                    state.collections = newResourceKeyList;

                    // See if the recently updated configs have errors
                    populateResourceConfigErrors(newResourceConfig, state);
                }
            }),
            false,
            'Resource Config Changed'
        );
    },

    setResourceSchema: (val) => {
        set(
            produce((state: ResourceConfigState) => {
                state.resourceSchema = val;
            }),
            false,
            'Resource Schema Set'
        );
    },

    stateChanged: () => {
        const { resourceConfig } = get();
        const { resourceConfig: initialResourceConfig } = getInitialStateData();

        return !isEqual(resourceConfig.data, initialResourceConfig.data);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Resource Config State Reset');
    },
});

export const createHydratedResourceConfigStore = (
    key: ResourceConfigStoreNames,
    workflow: EntityWorkflow
) => {
    return create<ResourceConfigState>()(
        devtools((set, get) => {
            const coreState = getInitialState(set, get);

            hydrateState(set, get, workflow).then(
                () => {
                    set(
                        produce((state: ResourceConfigState) => {
                            state.hydrated = true;
                        }),
                        false,
                        'Resource Config State Hydrated'
                    );
                },
                () => {
                    set(
                        produce((state: ResourceConfigState) => {
                            const error: HydrationError = {
                                message:
                                    'A problem was encountered when hydrating the resource configuration store.',
                                details:
                                    'This error occurred in the top-level create function.',
                            };

                            state.hydrated = true;

                            state.hydrationErrorsExist = true;
                            state.hydrationErrors = [
                                ...state.hydrationErrors,
                                error,
                            ];
                        }),
                        false,
                        'Resource Config Hydration Errors Detected'
                    );
                }
            );

            return coreState;
        }, devtoolsOptions(key))
    );
};

// Context Provider
interface ResourceConfigProviderProps {
    children: ReactNode;
    workflow: EntityWorkflow;
}

const invariableStore = {
    [ResourceConfigStoreNames.MATERIALIZATION]: {},
};

export const ResourceConfigContext = createReactContext<any | null>(null);

export const ResourceConfigProvider = ({
    children,
    workflow,
}: ResourceConfigProviderProps) => {
    const storeOptions = useConstant(() => {
        invariableStore[ResourceConfigStoreNames.MATERIALIZATION] =
            createHydratedResourceConfigStore(
                ResourceConfigStoreNames.MATERIALIZATION,
                workflow
            );

        return invariableStore;
    });

    return (
        <ResourceConfigContext.Provider value={storeOptions}>
            {children}
        </ResourceConfigContext.Provider>
    );
};

// TODO (useZustand) it would be great to check that the parent exists
//   and if so then enable the functionality relying on this. An example
//   where this would be good is the tables as any tables currently needs
//   the store even if they don't allow for selection
export const useResourceConfigStore = <S extends Object, U>(
    storeName: ResourceConfigStoreNames,
    selector: (state: S) => U,
    equalityFn?: any
) => {
    const storeOptions = useContext(ResourceConfigContext);
    const store = storeOptions[storeName];

    return useStore<StoreApi<S>, ReturnType<typeof selector>>(
        store,
        selector,
        equalityFn
    );
};

// Selector Hooks
const storeName = (entityType: ENTITY): ResourceConfigStoreNames => {
    if (entityType === ENTITY.MATERIALIZATION) {
        return ResourceConfigStoreNames.MATERIALIZATION;
    } else {
        throw new Error('Invalid ResourceConfig store name');
    }
};

export const useResourceConfig_collections = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(storeName(entityType), (state) => state.collections);
};

export const useResourceConfig_preFillEmptyCollections = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(storeName(entityType), (state) => state.preFillEmptyCollections);
};

export const useResourceConfig_preFillCollections = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(storeName(entityType), (state) => state.preFillCollections);
};

export const useResourceConfig_collectionErrorsExist = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(storeName(entityType), (state) => state.collectionErrorsExist);
};

export const useResourceConfig_currentCollection = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(storeName(entityType), (state) => state.currentCollection);
};

export const useResourceConfig_setCurrentCollection = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setCurrentCollection']
    >(storeName(entityType), (state) => state.setCurrentCollection);
};

export const useResourceConfig_resourceConfig = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(storeName(entityType), (state) => state.resourceConfig, shallow);
};

export const useResourceConfig_setResourceConfig = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(storeName(entityType), (state) => state.setResourceConfig);
};

export const useResourceConfig_resourceConfigErrorsExist = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(storeName(entityType), (state) => state.resourceConfigErrorsExist);
};

export const useResourceConfig_resourceConfigErrors = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrors']
    >(storeName(entityType), (state) => state.resourceConfigErrors);
};

export const useResourceConfig_resourceSchema = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(storeName(entityType), (state) => state.resourceSchema);
};

export const useResourceConfig_setResourceSchema = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(storeName(entityType), (state) => state.setResourceSchema);
};

export const useResourceConfig_stateChanged = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(storeName(entityType), (state) => state.stateChanged);
};

export const useResourceConfig_resetState = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(storeName(entityType), (state) => state.resetState);
};

export const useResourceConfig_hydrated = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['hydrated']
    >(storeName(entityType), (state) => state.hydrated);
};

export const useResourceConfig_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['hydrationErrorsExist']
    >(storeName(entityType), (state) => state.hydrationErrorsExist);
};
