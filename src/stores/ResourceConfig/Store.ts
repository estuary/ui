import {
    getLiveSpecsByLastPubId,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import {
    difference,
    has,
    isEmpty,
    isEqual,
    map,
    omit,
    pick,
    sortBy,
} from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { ResourceConfigStoreNames } from 'stores/names';
import { Schema } from 'types';
import { hasLength, truncateCatalogName } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { ResourceConfigDictionary, ResourceConfigState } from './types';

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
    | 'discoveredCollections'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
    | 'restrictedDiscoveredCollections'
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
    discoveredCollections: null,
    hydrated: false,
    hydrationErrorsExist: false,
    resourceConfig: {},
    resourceConfigErrorsExist: true,
    resourceConfigErrors: [],
    resourceSchema: {},
    restrictedDiscoveredCollections: [],
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
                const { resourceSchema } = get();

                const collections: string[] = [];
                const resourceConfig = {};

                value.forEach((capture) => {
                    capture.writes_to.forEach((collection) => {
                        collections.push(collection);
                        resourceConfig[collection] =
                            createJSONFormDefaults(resourceSchema);
                    });
                });

                state.collections = collections;
                state.currentCollection = collections[0];

                state.resourceConfig = resourceConfig;

                populateResourceConfigErrors(resourceConfig, state);

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
                    entityType === 'materialization'
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

    addCollections: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const { collections } = get();

                state.collections = collections
                    ? [
                          ...collections,
                          ...value.filter(
                              (newCollection) =>
                                  !collections.includes(newCollection)
                          ),
                      ]
                    : value;
            }),
            false,
            'Collection Added'
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

    removeAllCollections: (workflow, task) => {
        set(
            produce((state: ResourceConfigState) => {
                const {
                    collections,
                    discoveredCollections,
                    resourceConfig,
                    restrictedDiscoveredCollections,
                } = get();

                state.currentCollection = null;
                state.collections = [];

                let additionalRestrictedCollections: string[] = [];

                if (discoveredCollections) {
                    additionalRestrictedCollections =
                        discoveredCollections.filter(
                            (collection) =>
                                Object.hasOwn(resourceConfig, collection) &&
                                !restrictedDiscoveredCollections.includes(
                                    collection
                                )
                        );
                } else if (workflow === 'capture_edit' && collections) {
                    const catalogName = truncateCatalogName(task);

                    const nativeCollections = collections.filter((collection) =>
                        collection.includes(catalogName)
                    );

                    additionalRestrictedCollections = nativeCollections.filter(
                        (collection) =>
                            Object.hasOwn(resourceConfig, collection) &&
                            !restrictedDiscoveredCollections.includes(
                                collection
                            )
                    );
                }

                state.restrictedDiscoveredCollections = [
                    ...restrictedDiscoveredCollections,
                    ...additionalRestrictedCollections,
                ];

                state.resourceConfig = {};
            }),
            false,
            'Removed All Selected Collections'
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

    setDiscoveredCollections: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                const discoveredCollections: string[] = [];

                value.spec.bindings.forEach((binding: any) => {
                    discoveredCollections.push(binding.target);
                });

                state.discoveredCollections = discoveredCollections;
            }),
            false,
            'Discovered Collections Set'
        );
    },

    setRestrictedDiscoveredCollections: (value, nativeCollectionFlag) => {
        set(
            produce((state: ResourceConfigState) => {
                const {
                    discoveredCollections,
                    restrictedDiscoveredCollections,
                } = get();

                let restrictedCollections: string[] =
                    restrictedDiscoveredCollections;

                if (restrictedDiscoveredCollections.includes(value)) {
                    restrictedCollections =
                        restrictedDiscoveredCollections.filter(
                            (collection) => collection !== value
                        );
                } else if (
                    discoveredCollections?.includes(value) ||
                    nativeCollectionFlag
                ) {
                    restrictedCollections = [
                        value,
                        ...restrictedDiscoveredCollections,
                    ];
                }

                state.restrictedDiscoveredCollections = restrictedCollections;
            }),
            false,
            'Restricted Discovered Collections Set'
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

    resetResourceConfigAndCollections: () => {
        set(
            produce((state: ResourceConfigState) => {
                const { collections, discoveredCollections, resourceConfig } =
                    get();

                if (collections && discoveredCollections) {
                    state.collections = collections.filter(
                        (collection) =>
                            !discoveredCollections.includes(collection)
                    );

                    state.currentCollection =
                        state.collections.length > 0
                            ? state.collections[0]
                            : null;

                    const reducedResourceConfig = {};

                    Object.entries(resourceConfig).forEach(([key, value]) => {
                        if (state.collections?.includes(key)) {
                            reducedResourceConfig[key] = value;
                        }
                    });

                    state.resourceConfig = reducedResourceConfig;
                }
            }),
            false,
            'Resource Config and Collections Reset'
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
        const lastPubId = searchParams.get(GlobalSearchParams.LAST_PUB_ID);
        const liveSpecIds = searchParams.getAll(
            GlobalSearchParams.LIVE_SPEC_ID
        );

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
                // Prefills collections in the materialization create workflow when the Materialize CTA
                // on the Captures page is clicked.
                console.log('A');

                const { data, error } = await getLiveSpecsByLastPubId(
                    lastPubId,
                    'capture'
                );

                if (error) {
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const { preFillEmptyCollections } = get();

                    preFillEmptyCollections(data);
                }
            } else if (liveSpecIds.length > 0) {
                // Prefills collections in the materialization create workflow when the Materialize CTA
                // on the capture pubilication log dialog is clicked.
                const { data, error } = await getLiveSpecsByLiveSpecId(
                    liveSpecIds,
                    'capture'
                );

                if (error) {
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const { preFillEmptyCollections } = get();

                    preFillEmptyCollections(data);
                }
            }
        } else if (liveSpecIds.length > 0) {
            const { data, error } = await getLiveSpecsByLiveSpecId(
                liveSpecIds[0],
                entityType
            );

            if (error) {
                setHydrationErrorsExist(true);
            }

            if (data && data.length > 0) {
                const { setResourceConfig, preFillCollections } = get();

                const collectionNameProp =
                    entityType === 'materialization' ? 'source' : 'target';

                const sortedBindings = sortBy(data[0].spec.bindings, [
                    collectionNameProp,
                ]);

                sortedBindings.forEach((binding: any) =>
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

    evaluateDiscoveredCollections: (draftSpecResponse) => {
        set(
            produce((state: ResourceConfigState) => {
                const {
                    collections,
                    resourceConfig,
                    restrictedDiscoveredCollections,
                } = get();

                const existingCollections = Object.keys(resourceConfig);
                const updatedBindings = draftSpecResponse.data[0].spec.bindings;

                let collectionsToAdd: string[] = [];
                let modifiedResourceConfig: ResourceConfigDictionary = {};

                updatedBindings.forEach((binding: any) => {
                    if (
                        !existingCollections.includes(binding.target) &&
                        !restrictedDiscoveredCollections.includes(
                            binding.target
                        )
                    ) {
                        collectionsToAdd = [
                            binding.target,
                            ...collectionsToAdd,
                        ];

                        modifiedResourceConfig = {
                            [binding.target]: {
                                data: binding.resource,
                                errors: [],
                            },
                            ...modifiedResourceConfig,
                        };
                    }
                });

                state.resourceConfig = {
                    ...resourceConfig,
                    ...modifiedResourceConfig,
                };

                state.collections = collections
                    ? [
                          ...collections,
                          ...collectionsToAdd.filter(
                              (newCollection) =>
                                  !collections.includes(newCollection)
                          ),
                      ]
                    : collectionsToAdd;

                state.currentCollection = hasLength(updatedBindings)
                    ? updatedBindings[0].target
                    : null;
            }),
            false,
            'Discovered Collections Evaluated'
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
