import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsByLiveSpecId,
    getLiveSpecs_writesTo,
    getSchema_Resource,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import {
    difference,
    has,
    isBoolean,
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
import { devtoolsOptions } from 'utils/store-utils';
import { getCollectionName, getDisableProps } from 'utils/workflow-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { ResourceConfigDictionary, ResourceConfigState } from './types';

const populateCollections = (
    state: ResourceConfigState,
    collections: string[]
) => {
    state.collections = collections;
    state.currentCollection = collections[0] ?? null;

    state.collectionErrorsExist = isEmpty(collections);
};

const getNewCollectionList = (adds: string[], curr: string[] | null) => {
    return curr
        ? [...curr, ...adds.filter((add) => !curr.includes(add))]
        : adds;
};

const getResourceConfig = (binding: any) => {
    const { resource, disable } = binding;

    // Snag the name so we can add it to the config and list of collections
    const name = getCollectionName(binding);
    const disableProp = getDisableProps(disable);

    // Take the binding resource and place into config OR
    //  generate a default in case there are any issues with it
    return [
        name,
        {
            ...disableProp,
            data: resource,
            errors: [],
        },
    ];
};

const populateResourceConfigErrors = (
    resourceConfig: ResourceConfigDictionary,
    state: ResourceConfigState
): void => {
    let resourceConfigErrors: any[] = [];
    const hasConfigs = Object.keys(resourceConfig).length > 0;

    if (hasConfigs) {
        map(resourceConfig, (config) => {
            const { errors } = config;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (errors && errors.length > 0) {
                resourceConfigErrors = resourceConfigErrors.concat(errors);
            }
        });
    } else {
        // TODO (errors) Need to populate this object with something?
        resourceConfigErrors = [];
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

const getInitialCollectionStateData = (): Pick<
    ResourceConfigState,
    'collections' | 'collectionErrorsExist' | 'currentCollection'
> => ({
    collections: [],
    collectionErrorsExist: false,
    currentCollection: null,
});

const getInitialMiscStoreData = (): Pick<
    ResourceConfigState,
    | 'discoveredCollections'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
    | 'restrictedDiscoveredCollections'
    | 'serverUpdateRequired'
    | 'rediscoveryRequired'
> => ({
    discoveredCollections: null,
    hydrated: false,
    hydrationErrorsExist: false,
    resourceConfig: {},
    resourceConfigErrorsExist: false,
    resourceConfigErrors: [],
    resourceSchema: {},
    restrictedDiscoveredCollections: [],
    serverUpdateRequired: false,
    rediscoveryRequired: false,
});

const getInitialStateData = () => ({
    ...getInitialCollectionStateData(),
    ...getInitialMiscStoreData(),
});

const getInitialState = (
    set: NamedSet<ResourceConfigState>,
    get: StoreApi<ResourceConfigState>['getState']
): ResourceConfigState => ({
    ...getInitialStateData(),

    preFillEmptyCollections: (value, rehydrating) => {
        set(
            produce((state: ResourceConfigState) => {
                const { resourceConfig, resourceSchema, collections } = get();

                const emptyCollections: string[] =
                    rehydrating && collections ? collections : [];

                // Get a list of all the new collections that will be added
                value.forEach((capture) => {
                    capture?.writes_to.forEach((collection) => {
                        if (!emptyCollections.includes(collection)) {
                            emptyCollections.push(collection);
                        }
                    });
                });

                // Filter out any collections that are not in the emptyCollections list
                const modifiedCollections = collections
                    ? [
                          ...collections.filter(
                              (collection) =>
                                  !emptyCollections.includes(collection)
                          ),
                          ...emptyCollections,
                      ]
                    : emptyCollections;

                // Run through and make sure all collections have a corresponding resource config
                const modifiedResourceConfig = resourceConfig;
                modifiedCollections.forEach((collection) => {
                    // Rehydrating     wipe out all configs and start again
                    // Not rehydrating then we should allow the current config to stand
                    //  and only populate the ones that are missing
                    modifiedResourceConfig[collection] =
                        // Should not happen often but being safe with the resourceConfig check here
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        !rehydrating && resourceConfig[collection]
                            ? resourceConfig[collection]
                            : createJSONFormDefaults(
                                  resourceSchema,
                                  collection
                              );
                });

                state.resourceConfig = modifiedResourceConfig;
                populateCollections(state, modifiedCollections);
                populateResourceConfigErrors(modifiedResourceConfig, state);
            }),
            false,
            'Empty Collections Pre-filled'
        );
    },

    prefillResourceConfig: (bindings) => {
        set(
            produce((state: ResourceConfigState) => {
                console.log('prefillResourceConfig', {
                    bindings,
                });

                // As we go through and fetch all the names for collections go ahead and also
                // populate the resource config
                const collections = bindings.map((binding: any) => {
                    const [name, configVal] = getResourceConfig(binding);
                    state.resourceConfig[name] = configVal;

                    return name;
                });

                populateResourceConfigErrors(state.resourceConfig, state);
                populateCollections(state, collections);
            }),
            false,
            'Resource Config Prefilled'
        );
    },

    removeCollection: (value) => {
        set({ currentCollection: null });
        set(
            produce((state: ResourceConfigState) => {
                const { collections, resourceConfig } = get();

                const removedIndex = collections?.indexOf(value) ?? -1;
                if (collections && removedIndex > -1) {
                    const updatedCollections = collections.filter(
                        (collection) => collection !== value
                    );
                    populateCollections(state, updatedCollections);

                    // Try to keep the same index selected
                    //  Then try one above
                    //  Then try one below
                    //  Then give up
                    state.currentCollection =
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        updatedCollections[removedIndex] ??
                        updatedCollections[removedIndex - 1] ??
                        updatedCollections[removedIndex + 1] ??
                        null;

                    const updatedResourceConfig = pick(
                        resourceConfig,
                        updatedCollections
                    ) as ResourceConfigDictionary;

                    state.resourceConfig = updatedResourceConfig;
                    populateResourceConfigErrors(updatedResourceConfig, state);
                }
            }),
            false,
            'Collection Removed'
        );
    },

    removeCollections: (removedCollections, workflow, task) => {
        set(
            produce((state: ResourceConfigState) => {
                const {
                    collections,
                    discoveredCollections,
                    resourceConfig,
                    restrictedDiscoveredCollections,
                } = get();

                const updatedCollections = difference(
                    collections,
                    removedCollections
                );
                populateCollections(state, updatedCollections);

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
                    const nativeCollections = collections.filter((collection) =>
                        collection.includes(task)
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

                const updatedResourceConfig = omit(
                    resourceConfig,
                    removedCollections
                );
                state.resourceConfig = updatedResourceConfig;
                populateResourceConfigErrors(updatedResourceConfig, state);
            }),
            false,
            'Removed All Selected Collections'
        );
    },

    resetConfigAndCollections: () => {
        set(
            produce((state: ResourceConfigState) => {
                populateCollections(state, []);

                state.restrictedDiscoveredCollections = [];

                state.resourceConfig = {};
            }),
            false,
            'Resource Config and Collections Reset'
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

    updateResourceConfig: (key, value) => {
        const { resourceConfig, setResourceConfig } = get();

        // This was never empty in my testing but wanted to be safe
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const existingConfig = resourceConfig[key] ?? {};
        const updatedConfig = {
            ...existingConfig,
            ...value,
        };

        // Only actually update if there was a change. This is mainly here because
        //  as a user clicks through the bindings the resource config form will fire
        //  update function calls. This was causing a lot of extra checks in the
        //  useServerUpdateRequiredMonitor hook
        // TODO (zustand)
        // Not 100% sure why Zustand was still updating resourceConfig even when
        //  there were no real changes. Wondering if it is because we populate with a
        //  new object and that triggers it?
        // This might be related to how immer handles what is updated vs what
        //  is not during changes. Need to really dig into this later.
        if (!isEqual(existingConfig, updatedConfig)) {
            console.log('setting the resource config', {
                existingConfig,
                updatedConfig,
            });
            setResourceConfig(key, updatedConfig);
        }
    },

    setResourceConfig: (key, value, disableCheckingErrors, disableOmit) => {
        set(
            produce((state: ResourceConfigState) => {
                const { resourceSchema, collections } = get();

                if (typeof key === 'string') {
                    state.resourceConfig[key] =
                        value ?? createJSONFormDefaults(resourceSchema);

                    if (!disableCheckingErrors) {
                        populateResourceConfigErrors(
                            state.resourceConfig,
                            state
                        );
                        state.collectionErrorsExist = isEmpty(collections);
                    }
                } else {
                    const [removedCollections, newCollections] = whatChanged(
                        key,
                        state.resourceConfig
                    );

                    // Set defaults on new configs
                    newCollections.forEach((element) => {
                        state.resourceConfig[element] = createJSONFormDefaults(
                            resourceSchema,
                            element
                        );
                    });

                    // Remove any configs that are no longer needed unless disabled.
                    //   We disable for the new collection selection pop up where the user
                    //   is always adding collections and can only remove them manually in
                    //   the list
                    const newResourceConfig = disableOmit
                        ? state.resourceConfig
                        : omit(state.resourceConfig, removedCollections);
                    const newConfigKeyList = Object.keys(newResourceConfig);

                    // Update the config
                    state.resourceConfig = newResourceConfig;

                    // If previous state had no collections set to first
                    // If selected item is removed set to first.
                    // If adding new ones set to last
                    if (
                        (state.collections && state.collections.length === 0) ||
                        (state.currentCollection &&
                            !has(state.resourceConfig, state.currentCollection))
                    ) {
                        state.currentCollection = newConfigKeyList[0];
                    } else {
                        state.currentCollection =
                            newConfigKeyList[newConfigKeyList.length - 1];
                    }

                    // Update the collections with the new array
                    state.collections = newConfigKeyList;
                    state.collectionErrorsExist = isEmpty(newConfigKeyList);

                    // See if the recently updated configs have errors
                    populateResourceConfigErrors(newResourceConfig, state);
                }
            }),
            false,
            'Resource Config Changed'
        );
    },

    toggleDisable: (keys, value) => {
        // Updating a single item
        // A specific list (toggle page)
        // Nothing specified (toggle all)
        const updateKeys =
            typeof keys === 'string'
                ? [keys]
                : Array.isArray(keys)
                ? keys
                : get().collections;
        let updatedCount = 0;

        if (updateKeys && updateKeys.length > 0) {
            set(
                produce((state: ResourceConfigState) => {
                    updateKeys.forEach((key) => {
                        const currValue = isBoolean(
                            state.resourceConfig[key].disable
                        )
                            ? state.resourceConfig[key].disable
                            : false;
                        const newValue = value ?? !currValue;

                        if (value !== currValue) {
                            updatedCount = updatedCount + 1;
                        }

                        if (newValue) {
                            state.resourceConfig[key].disable = newValue;
                        } else {
                            delete state.resourceConfig[key].disable;
                        }
                    });
                }),
                false,
                'Resource Config Disable Toggle'
            );
        }

        // Return how many we updated
        return updatedCount;
    },

    resetResourceConfigAndCollections: () => {
        set(
            produce((state: ResourceConfigState) => {
                const { collections, discoveredCollections, resourceConfig } =
                    get();

                if (collections && discoveredCollections) {
                    const updatedCollections = collections.filter(
                        (collection) =>
                            !discoveredCollections.includes(collection)
                    );
                    populateCollections(state, updatedCollections);

                    const reducedResourceConfig = {};
                    Object.entries(resourceConfig).forEach(([key, value]) => {
                        if (state.collections?.includes(key)) {
                            reducedResourceConfig[key] = value;
                        }
                    });

                    state.resourceConfig = reducedResourceConfig;
                    populateResourceConfigErrors(reducedResourceConfig, state);
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

    hydrateState: async (editWorkflow, entityType, rehydrating) => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);
        const prefillPubIds = searchParams.getAll(
            GlobalSearchParams.PREFILL_PUB_ID
        );
        const liveSpecIds = searchParams.getAll(
            GlobalSearchParams.LIVE_SPEC_ID
        );
        const materializationHydrating = entityType === 'materialization';
        const materializationReydrating =
            materializationHydrating && rehydrating;

        const { resetState, setHydrationErrorsExist } = get();
        resetState(materializationReydrating);

        if (connectorId) {
            const { data, error } = await getSchema_Resource(connectorId);

            if (error) {
                setHydrationErrorsExist(true);
            } else if (data && data.length > 0) {
                const { setResourceSchema } = get();

                setResourceSchema(
                    data[0].resource_spec_schema as unknown as Schema
                );
            }
        }

        if (editWorkflow && liveSpecIds.length > 0) {
            const { data, error } = draftId
                ? await getDraftSpecsByDraftId(draftId, entityType)
                : await getLiveSpecsByLiveSpecId(liveSpecIds[0], entityType);

            if (error) {
                setHydrationErrorsExist(true);
            } else if (data && data.length > 0) {
                const { prefillResourceConfig } = get();

                const collectionNameProp = materializationHydrating
                    ? 'source'
                    : 'target';

                // TODO (direct bindings) We can remove this when/if we move the UI
                //   to using the bindings directly and save a lot of processing
                const sortedBindings = sortBy(data[0].spec.bindings, [
                    collectionNameProp,
                ]);
                prefillResourceConfig(sortedBindings);
            }
        }

        if (prefillPubIds.length > 0) {
            // Prefills collections in the materialization create workflow when the Materialize CTA
            // on the Captures page or the capture publication log dialog is clicked.
            const { data, error } = await getLiveSpecs_writesTo(
                prefillPubIds,
                'capture'
            );

            if (error) {
                setHydrationErrorsExist(true);
            } else if (data && data.length > 0) {
                const { preFillEmptyCollections } = get();
                preFillEmptyCollections(data, rehydrating);
            }
        } else if (materializationReydrating) {
            // If there is nothign to prefill but we are rehydrating we want to make sure
            //  we prefill any collections the user already selected but only for materializations
            //  because for a Capture the collections are discovered and if the hydration is kicked
            //  off then they will need to rediscover everything again
            const { preFillEmptyCollections } = get();
            preFillEmptyCollections([], rehydrating);
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

    setRediscoveryRequired: (value) => {
        set(
            produce((state: ResourceConfigState) => {
                state.rediscoveryRequired = value;
            }),
            false,
            'Rediscovery Required Flag Changed'
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

                const collectionsToAdd: string[] = [];
                const modifiedResourceConfig: ResourceConfigDictionary = {};

                updatedBindings.forEach((binding: any) => {
                    if (
                        !existingCollections.includes(binding.target) &&
                        !restrictedDiscoveredCollections.includes(
                            binding.target
                        )
                    ) {
                        collectionsToAdd.push(binding.target);

                        const [name, configVal] = getResourceConfig(binding);
                        modifiedResourceConfig[name] = configVal;
                    }
                });

                state.resourceConfig = {
                    ...resourceConfig,
                    ...modifiedResourceConfig,
                };

                populateCollections(
                    state,
                    getNewCollectionList(collectionsToAdd, collections)
                );
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

    resetState: (keepCollections) => {
        const currentState = get();
        const initState = keepCollections
            ? getInitialMiscStoreData()
            : getInitialStateData();
        const newState = {
            ...currentState,
            ...initState,
        };

        set(newState, false, 'Resource Config State Reset');
    },
});

export const createResourceConfigStore = (key: ResourceConfigStoreNames) => {
    return create<ResourceConfigState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
