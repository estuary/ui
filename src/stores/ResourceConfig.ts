import {
    getLiveSpecsByLastPubId,
    getLiveSpecsByLiveSpecId,
    getResourceSchema,
} from 'api/hydration';
import { useEntityWorkflow } from 'context/Workflow';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { useResourceConfigStore } from 'context/zustand/ResourceConfig';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { ENTITY, EntityWorkflow, JsonFormsData, Schema } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import shallow from 'zustand/shallow';

export interface ResourceConfig {
    [key: string]: JsonFormsData | any[];
    errors: any[];
}

export interface ResourceConfigDictionary {
    [key: string]: ResourceConfig;
}

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
    setHydrated: (value: boolean) => void;

    hydrationErrors: any[];

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
    | 'hydrationErrors'
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
> => ({
    collections: [],
    collectionErrorsExist: true,
    currentCollection: null,
    hydrated: true,
    hydrationErrors: [],
    resourceConfig: {},
    resourceConfigErrorsExist: true,
    resourceConfigErrors: [],
    resourceSchema: {},
});

const hydrateState = (
    get: StoreApi<ResourceConfigState>['getState'],
    workflow: EntityWorkflow
): void => {
    const searchParams = new URLSearchParams(window.location.search);
    const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
    const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);
    const lastPubId = searchParams.get(GlobalSearchParams.LAST_PUB_ID);

    if (connectorId) {
        getResourceSchema(connectorId).then(
            ({ data }) => {
                if (data && data.length > 0) {
                    const { setResourceSchema } = get();

                    setResourceSchema(
                        data[0].resource_spec_schema as unknown as Schema
                    );
                }
            },
            () => {
                console.log('rejected');
            }
        );
    }

    if (workflow === 'materialization_create') {
        const specType = ENTITY.CAPTURE;

        if (lastPubId) {
            getLiveSpecsByLastPubId(lastPubId, specType).then(
                ({ data }) => {
                    if (data && data.length > 0) {
                        const { preFillEmptyCollections } = get();

                        preFillEmptyCollections(data);
                    }
                },
                () => {
                    console.log('lastPub: empty collections rejected');
                }
            );
        } else if (liveSpecId) {
            getLiveSpecsByLiveSpecId(liveSpecId, specType).then(
                ({ data }) => {
                    if (data && data.length > 0) {
                        const { preFillEmptyCollections } = get();

                        preFillEmptyCollections(data);
                    }
                },
                () => {
                    console.log('liveSpec: empty collections rejected');
                }
            );
        }
    } else if (workflow === 'materialization_edit' && liveSpecId) {
        getLiveSpecsByLiveSpecId(liveSpecId, ENTITY.MATERIALIZATION).then(
            ({ data }) => {
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
            },
            () => {
                console.log('liveSpec: empty collections rejected');
            }
        );
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

    setHydrated: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                state.hydrated = value;
            }),
            false,
            'Resource Config State Hydrated'
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

export const createResourceConfigStore = (
    key: ResourceConfigStoreNames,
    workflow: EntityWorkflow
) => {
    return create<ResourceConfigState>()(
        devtools((set, get) => {
            const state = getInitialState(set, get);

            hydrateState(get, workflow);

            return state;
        }, devtoolsOptions(key))
    );
};

// Selector Hooks
const storeName = (workflow: EntityWorkflow): ResourceConfigStoreNames => {
    if (workflow === 'materialization_create') {
        return ResourceConfigStoreNames.MATERIALIZATION_CREATE;
    } else if (workflow === 'materialization_edit') {
        return ResourceConfigStoreNames.MATERIALIZATION_EDIT;
    } else {
        throw new Error('Invalid ResourceConfig store name');
    }
};

export const useResourceConfig_collections = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(storeName(workflow), (state) => state.collections);
};

export const useResourceConfig_preFillEmptyCollections = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(storeName(workflow), (state) => state.preFillEmptyCollections);
};

export const useResourceConfig_preFillCollections = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(storeName(workflow), (state) => state.preFillCollections);
};

export const useResourceConfig_collectionErrorsExist = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(storeName(workflow), (state) => state.collectionErrorsExist);
};

export const useResourceConfig_currentCollection = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(storeName(workflow), (state) => state.currentCollection);
};

export const useResourceConfig_setCurrentCollection = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setCurrentCollection']
    >(storeName(workflow), (state) => state.setCurrentCollection);
};

export const useResourceConfig_resourceConfig = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(storeName(workflow), (state) => state.resourceConfig, shallow);
};

export const useResourceConfig_setResourceConfig = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(storeName(workflow), (state) => state.setResourceConfig);
};

export const useResourceConfig_resourceConfigErrorsExist = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(storeName(workflow), (state) => state.resourceConfigErrorsExist);
};

export const useResourceConfig_resourceConfigErrors = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrors']
    >(storeName(workflow), (state) => state.resourceConfigErrors);
};

export const useResourceConfig_resourceSchema = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(storeName(workflow), (state) => state.resourceSchema);
};

export const useResourceConfig_setResourceSchema = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(storeName(workflow), (state) => state.setResourceSchema);
};

export const useResourceConfig_stateChanged = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(storeName(workflow), (state) => state.stateChanged);
};

export const useResourceConfig_resetState = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(storeName(workflow), (state) => state.resetState);
};

export const useResourceConfig_setHydrated = () => {
    const workflow = useEntityWorkflow();

    return useResourceConfigStore<
        ResourceConfigState,
        ResourceConfigState['setHydrated']
    >(storeName(workflow), (state) => state.setHydrated);
};
