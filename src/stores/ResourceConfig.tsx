import {
    getLiveSpecsByLastPubId,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit, pick } from 'lodash';
import { ReactNode } from 'react';
import { useEffectOnce } from 'react-use';
import { createJSONFormDefaults } from 'services/ajv';
import { ENTITY, JsonFormsData, Schema } from 'types';
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
    preFillCollections: (
        liveSpecsData: LiveSpecsExtQuery[],
        entityType: ENTITY
    ) => void;
    removeCollection: (value: string) => void;

    collectionRemovalMetadata: {
        selectedCollection: string | null;
        removedCollection: string;
        index: number;
    };

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
    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;

    hydrateState: (editWorkflow: boolean, entityType: ENTITY) => Promise<void>;

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

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
    | 'collectionRemovalMetadata'
    | 'currentCollection'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
    | 'serverUpdateRequired'
> => ({
    collections: [],
    collectionErrorsExist: true,
    collectionRemovalMetadata: {
        selectedCollection: null,
        removedCollection: '',
        index: -1,
    },
    currentCollection: null,
    hydrated: false,
    hydrationErrorsExist: false,
    resourceConfig: {},
    resourceConfigErrorsExist: true,
    resourceConfigErrors: [],
    resourceSchema: {},
    serverUpdateRequired: false,
});

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

    preFillCollections: (value, entityType) => {
        set(
            produce((state: ResourceConfigState) => {
                const collections: string[] = [];

                const queryProp =
                    entityType === ENTITY.MATERIALIZATION
                        ? 'reads_from'
                        : 'writes_to';

                value.forEach((queryData) => {
                    queryData[queryProp].forEach((collection) => {
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

    removeCollection: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const { collections, currentCollection, resourceConfig } =
                    get();

                if (collections?.includes(value)) {
                    state.collectionRemovalMetadata = {
                        selectedCollection: currentCollection,
                        removedCollection: value,
                        index: collections.findIndex(
                            (collection) => collection === value
                        ),
                    };

                    state.collections = collections.filter(
                        (collection) => collection !== value
                    );

                    const updatedResourceConfig = pick(
                        resourceConfig,
                        state.collections
                    ) as ResourceConfigDictionary;

                    state.resourceConfig = updatedResourceConfig;
                }
            }),
            false,
            'Collection Removed'
        );
    },

    setCurrentCollection: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const {
                    collections,
                    collectionRemovalMetadata: {
                        selectedCollection,
                        removedCollection,
                        index: removedCollectionIndex,
                    },
                } = get();

                const collectionCount = collections?.length;

                if (value && collections?.includes(value)) {
                    state.currentCollection = value;
                } else if (
                    collectionCount &&
                    selectedCollection === removedCollection
                ) {
                    if (
                        removedCollectionIndex > -1 &&
                        removedCollectionIndex < collections.length
                    ) {
                        state.currentCollection =
                            collections[removedCollectionIndex];
                    } else if (removedCollectionIndex === collections.length) {
                        state.currentCollection =
                            collections[removedCollectionIndex - 1];
                    }
                } else if (collectionCount && removedCollection === value) {
                    state.currentCollection = selectedCollection;
                } else {
                    state.currentCollection = null;
                }
            }),
            false,
            'Current Collection Changed'
        );
    },

    setResourceConfig: (key, value) => {
        set(
            produce((state: ResourceConfigState) => {
                const { resourceSchema, collections } = get();

                if (typeof key === 'string') {
                    state.resourceConfig[key] =
                        value ?? createJSONFormDefaults(resourceSchema);

                    populateResourceConfigErrors(state.resourceConfig, state);

                    state.collectionErrorsExist = isEmpty(collections);
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
                    state.collectionErrorsExist = isEmpty(newResourceKeyList);

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

    setHydrationErrorsExist: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                state.hydrationErrorsExist = value;
            }),
            false,
            'Resource Config Hydration Errors Detected'
        );
    },

    hydrateState: async (editWorkflow, entityType) => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);
        const lastPubId = searchParams.get(GlobalSearchParams.LAST_PUB_ID);

        const { setHydrationErrorsExist } = get();

        if (connectorId) {
            const { data, error } = await getSchema_Resource(connectorId);

            if (error) {
                setHydrationErrorsExist(true);
            }

            if (data && data.length > 0) {
                const { setResourceSchema } = get();

                setResourceSchema(
                    data[0].resource_spec_schema as unknown as Schema
                );
            }
        }

        if (!editWorkflow) {
            if (lastPubId) {
                const { data, error } = await getLiveSpecsByLastPubId(
                    lastPubId,
                    entityType
                );

                if (error) {
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const { preFillEmptyCollections } = get();

                    preFillEmptyCollections(data);
                }
            } else if (liveSpecId) {
                const { data, error } = await getLiveSpecsByLiveSpecId(
                    liveSpecId,
                    entityType
                );

                if (error) {
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const { preFillEmptyCollections } = get();

                    preFillEmptyCollections(data);
                }
            }
        } else if (liveSpecId) {
            const { data, error } = await getLiveSpecsByLiveSpecId(
                liveSpecId,
                entityType
            );

            if (error) {
                setHydrationErrorsExist(true);
            }

            if (data && data.length > 0) {
                const { setResourceConfig, preFillCollections } = get();

                const collectionNameProp =
                    entityType === ENTITY.MATERIALIZATION ? 'source' : 'target';

                data[0].spec.bindings.forEach((binding: any) =>
                    setResourceConfig(binding[collectionNameProp], {
                        data: binding.resource,
                        errors: [],
                    })
                );

                preFillCollections(data, entityType);
            }
        }
    },

    setServerUpdateRequired: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                state.serverUpdateRequired = value;
            }),
            false,
            'Server Update Required Flag Changed'
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

export const createResourceConfigStore = (key: ResourceConfigStoreNames) => {
    return create<ResourceConfigState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

// Selector Hooks
const getStoreName = (entityType: ENTITY): ResourceConfigStoreNames => {
    if (
        entityType === ENTITY.CAPTURE ||
        entityType === ENTITY.MATERIALIZATION
    ) {
        return ResourceConfigStoreNames.GENERAL;
    } else {
        throw new Error('Invalid ResourceConfig store name');
    }
};

export const useResourceConfig_collections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(getStoreName(entityType), (state) => state.collections);
};

export const useResourceConfig_preFillEmptyCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(getStoreName(entityType), (state) => state.preFillEmptyCollections);
};

export const useResourceConfig_preFillCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(getStoreName(entityType), (state) => state.preFillCollections);
};

export const useResourceConfig_removeCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeCollection']
    >(getStoreName(entityType), (state) => state.removeCollection);
};

export const useResourceConfig_collectionErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(getStoreName(entityType), (state) => state.collectionErrorsExist);
};

export const useResourceConfig_currentCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(getStoreName(entityType), (state) => state.currentCollection);
};

export const useResourceConfig_setCurrentCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setCurrentCollection']
    >(getStoreName(entityType), (state) => state.setCurrentCollection);
};

export const useResourceConfig_resourceConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(getStoreName(entityType), (state) => state.resourceConfig, shallow);
};

export const useResourceConfig_setResourceConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(getStoreName(entityType), (state) => state.setResourceConfig);
};

export const useResourceConfig_resourceConfigErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(getStoreName(entityType), (state) => state.resourceConfigErrorsExist);
};

export const useResourceConfig_resourceConfigErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrors']
    >(getStoreName(entityType), (state) => state.resourceConfigErrors);
};

export const useResourceConfig_resourceSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(getStoreName(entityType), (state) => state.resourceSchema);
};

export const useResourceConfig_setResourceSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(getStoreName(entityType), (state) => state.setResourceSchema);
};

export const useResourceConfig_stateChanged = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(getStoreName(entityType), (state) => state.stateChanged);
};

export const useResourceConfig_resetState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};

export const useResourceConfig_hydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrated']
    >(getStoreName(entityType), (state) => state.hydrated);
};

export const useResourceConfig_setHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrated']
    >(getStoreName(entityType), (state) => state.setHydrated);
};

export const useResourceConfig_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.hydrationErrorsExist);
};

export const useResourceConfig_setHydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.setHydrationErrorsExist);
};

export const useResourceConfig_hydrateState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrateState']
    >(getStoreName(entityType), (state) => state.hydrateState);
};

export const useResourceConfig_serverUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['serverUpdateRequired']
    >(getStoreName(entityType), (state) => state.serverUpdateRequired);
};

export const useResourceConfig_setServerUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setServerUpdateRequired']
    >(getStoreName(entityType), (state) => state.setServerUpdateRequired);
};

// Hydrator
interface ResourceConfigHydratorProps {
    children: ReactNode;
}

export const ResourceConfigHydrator = ({
    children,
}: ResourceConfigHydratorProps) => {
    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'materialization_edit' || workflow === 'capture_edit';

    const hydrated = useResourceConfig_hydrated();
    const setHydrated = useResourceConfig_setHydrated();

    const setHydrationErrorsExist = useResourceConfig_setHydrationErrorsExist();

    const hydrateState = useResourceConfig_hydrateState();

    useEffectOnce(() => {
        if (workflow && !hydrated) {
            hydrateState(editWorkflow, entityType).then(
                () => {
                    setHydrated(true);
                },
                () => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                }
            );
        }
    });

    return <div>{children}</div>;
};
