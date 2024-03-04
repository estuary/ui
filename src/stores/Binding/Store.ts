import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsById_writesTo,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import {
    difference,
    has,
    intersection,
    isBoolean,
    isEmpty,
    isEqual,
    omit,
    omitBy,
    orderBy,
    pick,
    union,
} from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BindingStoreNames } from 'stores/names';
import { populateErrors } from 'stores/utils';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import {
    getBackfillCounter,
    getBindingIndex,
    getCollectionName,
    getDisableProps,
} from 'utils/workflow-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import {
    getInitialFieldSelectionData,
    getStoreWithFieldSelectionSettings,
} from './slices/FieldSelection';
import {
    BindingMetadata,
    BindingState,
    Bindings,
    ResourceConfig,
    ResourceConfigDictionary,
} from './types';

const STORE_KEY = 'Bindings';

const initializeBinding = (
    state: BindingState,
    collection: string,
    bindingUUID: string
) => {
    const existingBindingUUIDs: string[] = Object.hasOwn(
        state.bindings,
        collection
    )
        ? state.bindings[collection]
        : [];

    state.bindings[collection] = existingBindingUUIDs.concat(bindingUUID);
};

const initializeCurrentBinding = (
    state: BindingState,
    resourceConfigs: ResourceConfigDictionary
) => {
    const initialConfig = Object.entries(resourceConfigs).at(0);

    if (initialConfig) {
        const [bindingUUID, resourceConfig] = initialConfig;

        state.currentBinding = {
            uuid: bindingUUID,
            collection: resourceConfig.meta.collectionName,
        };
    }
};

const getResourceConfig = (
    binding: any,
    bindingIndex: number
): ResourceConfig => {
    const { resource, disable } = binding;

    const collectionName = getCollectionName(binding);
    const disableProp = getDisableProps(disable);

    // Take the binding resource and place into config OR
    // generate a default in case there are any issues with it
    return {
        data: resource,
        errors: [],
        meta: { ...disableProp, collectionName, bindingIndex },
    };
};

// TODO (optimization): Use this function in the ported over resource config store action, evaluateDiscoveredCollections.
const initializeResourceConfig = (
    state: BindingState,
    binding: any,
    bindingUUID: string,
    bindingIndex: number
) => {
    const config = getResourceConfig(binding, bindingIndex);

    state.resourceConfigs[bindingUUID] = config;

    if (config.meta.disable) {
        state.resourceConfigs[bindingUUID].meta.previouslyDisabled = true;
    }
};

const populateResourceConfigErrors = (
    state: BindingState,
    resourceConfigs: ResourceConfigDictionary
): void => {
    const { configErrors, hasErrors } = populateErrors(resourceConfigs);

    state.resourceConfigErrors = configErrors;
    state.resourceConfigErrorsExist = hasErrors;
};

const sortBindings = (bindings: any) => {
    return orderBy(
        bindings,
        ['disable', (binding) => getCollectionName(binding)],
        ['desc', 'asc']
    );
};

const whatChanged = (
    bindings: Bindings,
    resourceConfig: ResourceConfigDictionary,
    targetCollections: string[]
) => {
    const currentBindings = Object.keys(resourceConfig);

    const currentCollections = Object.entries(bindings)
        .filter(
            ([_collection, bindingUUIDs]) =>
                intersection(bindingUUIDs, currentBindings).length > 0
        )
        .map(([collection]) => collection);

    const removedCollections = difference(
        currentCollections,
        targetCollections
    );

    const addedCollections = difference(targetCollections, currentCollections);

    return [removedCollections, addedCollections];
};

const getInitialBindingData = (): Pick<
    BindingState,
    'bindingErrorsExist' | 'bindings' | 'currentBinding'
> => ({
    bindingErrorsExist: false,
    bindings: {},
    currentBinding: null,
});

const getInitialStateData = (): Pick<
    BindingState,
    | 'backfillAllBindings'
    | 'backfilledCollections'
    | 'collectionsRequiringRediscovery'
    | 'discoveredCollections'
    | 'rediscoveryRequired'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceConfigs'
    | 'resourceSchema'
    | 'restrictedDiscoveredCollections'
    | 'serverUpdateRequired'
> => ({
    backfillAllBindings: false,
    backfilledCollections: [],
    collectionsRequiringRediscovery: [],
    discoveredCollections: [],
    rediscoveryRequired: false,
    resourceConfigErrorsExist: false,
    resourceConfigErrors: [],
    resourceConfigs: {},
    resourceSchema: {},
    restrictedDiscoveredCollections: [],
    serverUpdateRequired: false,
});

const getInitialStoreData = () => ({
    ...getInitialBindingData(),
    ...getInitialFieldSelectionData(),
    ...getInitialHydrationData(),
    ...getInitialStateData(),
});

const getInitialState = (
    set: NamedSet<BindingState>,
    get: StoreApi<BindingState>['getState']
): BindingState => ({
    ...getInitialStoreData(),
    ...getStoreWithFieldSelectionSettings(set),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

    addBackfilledCollections: (values) => {
        set(
            produce((state: BindingState) => {
                state.backfilledCollections = union(
                    state.backfilledCollections,
                    values
                );
            }),
            false,
            'Backfilled Collections Added'
        );
    },

    addEmptyBindings: (data, rehydrating) => {
        set(
            produce((state: BindingState) => {
                const collections = state.getCollections();

                const emptyCollections: string[] =
                    rehydrating && hasLength(collections) ? collections : [];

                // Get a list of all the new collections that will be added
                data?.forEach((datum) => {
                    if (datum.spec_type === 'collection') {
                        if (!emptyCollections.includes(datum.catalog_name)) {
                            emptyCollections.push(datum.catalog_name);
                        }
                    } else {
                        datum.writes_to.forEach((collection) => {
                            if (!emptyCollections.includes(collection)) {
                                emptyCollections.push(collection);
                            }
                        });
                    }
                });

                const newCollections = difference(
                    emptyCollections,
                    collections
                );

                newCollections.forEach((collection) => {
                    if (!Object.hasOwn(state.bindings, collection)) {
                        const UUID = crypto.randomUUID();

                        state.bindings[collection] = [UUID];
                    }
                });

                // Run through and make sure all collections have a corresponding resource config
                const modifiedResourceConfigs = state.resourceConfigs;

                Object.entries(state.bindings).forEach(
                    ([collectionName, bindingUUIDs], outerIndex) => {
                        bindingUUIDs.forEach((bindingUUID, innerIndex) => {
                            const bindingIndex = outerIndex + innerIndex;

                            // Rehydrating wipe out all configs and start again
                            // Not rehydrating then we should allow the current config to stand
                            //  and only populate the ones that are missing

                            // Should not happen often but being safe with the resourceConfigs check here
                            if (
                                !rehydrating &&
                                Object.hasOwn(
                                    state.resourceConfigs,
                                    bindingUUID
                                )
                            ) {
                                state.resourceConfigs[
                                    bindingUUID
                                ].meta.bindingIndex = bindingIndex;

                                modifiedResourceConfigs[bindingUUID] =
                                    state.resourceConfigs[bindingUUID];
                            } else {
                                modifiedResourceConfigs[bindingUUID] = {
                                    ...createJSONFormDefaults(
                                        state.resourceSchema,
                                        collectionName
                                    ),
                                    meta: { collectionName, bindingIndex },
                                };
                            }
                        });
                    }
                );

                state.resourceConfigs = modifiedResourceConfigs;
                populateResourceConfigErrors(state, modifiedResourceConfigs);

                state.bindingErrorsExist = isEmpty(state.bindings);
                initializeCurrentBinding(state, modifiedResourceConfigs);
            }),
            false,
            'Empty bindings added'
        );
    },

    evaluateDiscoveredBindings: (draftSpecResponse) => {
        set(
            produce((state: BindingState) => {
                state.bindings = {};
                state.restrictedDiscoveredCollections = [];
                state.resourceConfigs = {};

                const discoveredBindings =
                    draftSpecResponse.data[0].spec.bindings;

                sortBindings(discoveredBindings).forEach(
                    (binding: any, index) => {
                        const collection = getCollectionName(binding);
                        const UUID = crypto.randomUUID();

                        initializeBinding(state, collection, UUID);
                        initializeResourceConfig(state, binding, UUID, index);
                    }
                );

                state.discoveredCollections = Object.values(
                    state.resourceConfigs
                ).map(({ meta }) => meta.collectionName);

                populateResourceConfigErrors(state, state.resourceConfigs);

                state.bindingErrorsExist = isEmpty(state.bindings);
                initializeCurrentBinding(state, state.resourceConfigs);
            }),
            false,
            'Discovered bindings evaluated'
        );
    },

    getCollections: () =>
        Object.values(get().resourceConfigs).map(
            ({ meta }) => meta.collectionName
        ),

    hydrateState: async (editWorkflow, entityType, rehydrating) => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);
        const liveSpecIds = searchParams.getAll(
            GlobalSearchParams.LIVE_SPEC_ID
        );
        const prefillLiveSpecIds = searchParams.getAll(
            GlobalSearchParams.PREFILL_LIVE_SPEC_ID
        );

        const materializationHydrating = entityType === 'materialization';
        const materializationRehydrating =
            materializationHydrating && rehydrating;

        const { setHydrationErrorsExist } = get();

        // resetState(materializationRehydrating);

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
            const { data: liveSpecs, error: liveSpecError } =
                await getLiveSpecsByLiveSpecId(liveSpecIds[0], entityType);

            if (liveSpecError) {
                setHydrationErrorsExist(true);
            } else if (liveSpecs && liveSpecs.length > 0) {
                const { prefillBindingDependentState } = get();

                if (draftId) {
                    const { data: draftSpecs, error: draftSpecError } =
                        await getDraftSpecsByDraftId(draftId, entityType);

                    if (draftSpecError) {
                        setHydrationErrorsExist(true);
                    } else if (draftSpecs && draftSpecs.length > 0) {
                        prefillBindingDependentState(
                            liveSpecs[0].spec.bindings,
                            draftSpecs[0].spec.bindings
                        );
                    }
                } else {
                    prefillBindingDependentState(
                        sortBindings(liveSpecs[0].spec.bindings)
                    );
                }
            }
        }

        if (prefillLiveSpecIds.length > 0) {
            // Prefills bindings in materialization workflows when the Materialize CTA
            // on the Captures page, Collections page, or captures/collections Details page is clicked.
            const { data, error } = await getLiveSpecsById_writesTo(
                prefillLiveSpecIds
            );

            if (error) {
                setHydrationErrorsExist(true);
            } else if (data && data.length > 0) {
                get().addEmptyBindings(data, rehydrating);

                return Promise.resolve(data);
            }
        } else if (materializationRehydrating) {
            // If there is nothing to prefill but we are rehydrating we want to make sure
            //  we prefill any collections the user already selected but only for materializations
            //  because for a Capture the collections are discovered and if the hydration is kicked
            //  off then they will need to rediscover everything again
            get().addEmptyBindings([], rehydrating);
            return Promise.resolve([]);
        }

        return Promise.resolve(null);
    },

    prefillBindingDependentState: (liveBindings, draftedBindings) => {
        set(
            produce((state: BindingState) => {
                const bindings = draftedBindings ?? liveBindings;

                bindings.forEach((binding, index) => {
                    if (draftedBindings) {
                        // Prefill backfilled collections
                        const collection = getCollectionName(binding);

                        const draftedBackfillCounter =
                            getBackfillCounter(binding);

                        const liveBindingIndex = getBindingIndex(
                            liveBindings,
                            collection
                        );
                        const liveBackfillCounter =
                            liveBindingIndex > -1
                                ? getBackfillCounter(
                                      liveBindings[liveBindingIndex]
                                  )
                                : 0;

                        if (
                            liveBackfillCounter !== draftedBackfillCounter ||
                            (liveBindingIndex === -1 &&
                                draftedBackfillCounter > 0)
                        ) {
                            state.backfilledCollections.push(collection);
                        }
                    }

                    const collection = getCollectionName(binding);
                    const UUID = crypto.randomUUID();

                    initializeBinding(state, collection, UUID);
                    initializeResourceConfig(state, binding, UUID, index);
                });

                populateResourceConfigErrors(state, state.resourceConfigs);

                state.bindingErrorsExist = isEmpty(state.bindings);
                initializeCurrentBinding(state, state.resourceConfigs);
            }),
            false,
            'Binding dependent state prefilled'
        );
    },

    removeBackfilledCollections: (values) => {
        set(
            produce((state: BindingState) => {
                state.backfilledCollections =
                    state.backfilledCollections.filter(
                        (collection) => !values.includes(collection)
                    );
            }),
            false,
            'Backfilled Collections Removed'
        );
    },

    removeBinding: ({ uuid, collection }) => {
        set(
            produce((state: BindingState) => {
                const removedIndex = Object.keys(state.resourceConfigs).indexOf(
                    uuid
                );

                if (removedIndex > -1) {
                    // Remove the binding from the resource config dictionary.
                    const evaluatedResourceConfigs = omit(
                        state.resourceConfigs,
                        [uuid]
                    );

                    state.resourceConfigs = evaluatedResourceConfigs;
                    populateResourceConfigErrors(
                        state,
                        evaluatedResourceConfigs
                    );

                    // Update the value of the current binding.
                    const mappedUUIDsAndResourceConfigs = Object.entries(
                        evaluatedResourceConfigs
                    );

                    // Try to keep the same index selected
                    //  Then try one above
                    //  Then try one below
                    //  Then give up
                    const [evaluatedBindingUUID, evaluatedResourceConfig]:
                        | [string, ResourceConfig]
                        | [undefined, undefined] =
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        mappedUUIDsAndResourceConfigs[removedIndex] ??
                            mappedUUIDsAndResourceConfigs[removedIndex - 1] ??
                            mappedUUIDsAndResourceConfigs[removedIndex + 1] ?? [
                                undefined,
                                undefined,
                            ];

                    state.currentBinding = Boolean(
                        evaluatedBindingUUID && evaluatedResourceConfig
                    )
                        ? {
                              uuid: evaluatedBindingUUID,
                              collection:
                                  evaluatedResourceConfig.meta.collectionName,
                          }
                        : null;

                    // Remove the binding from the bindings dictionary.
                    const evaluatedBindings = state.bindings;

                    evaluatedBindings[collection] = state.bindings[
                        collection
                    ].filter((bindingUUID) => bindingUUID !== uuid);

                    state.bindings =
                        evaluatedBindings[collection].length === 0
                            ? omit(evaluatedBindings, collection)
                            : evaluatedBindings;

                    state.bindingErrorsExist = isEmpty(evaluatedBindings);
                }
            }),
            false,
            'Binding Removed'
        );
    },

    removeBindings: (targetUUIDs, workflow, taskName) => {
        set(
            produce((state: BindingState) => {
                const collections = state.getCollections();

                // Remove the selected bindings from the resource config dictionary.
                const evaluatedResourceConfigs = omit(
                    state.resourceConfigs,
                    targetUUIDs
                );

                state.resourceConfigs = evaluatedResourceConfigs;
                populateResourceConfigErrors(state, evaluatedResourceConfigs);

                // Repopulate the bindings dictionary and update the value of the current binding.
                const mappedUUIDsAndResourceConfigs = Object.entries(
                    evaluatedResourceConfigs
                );

                if (hasLength(mappedUUIDsAndResourceConfigs)) {
                    mappedUUIDsAndResourceConfigs.forEach(
                        ([uuid, resourceConfig]) => {
                            initializeBinding(
                                state,
                                resourceConfig.meta.collectionName,
                                uuid
                            );
                        }
                    );

                    const [uuid, resourceConfig] =
                        mappedUUIDsAndResourceConfigs[0];

                    state.currentBinding = {
                        uuid,
                        collection: resourceConfig.meta.collectionName,
                    };
                } else {
                    state.bindings = {};
                    state.currentBinding = null;
                }

                state.bindingErrorsExist = isEmpty(state.bindings);

                // Update the set of restricted discovered collections.
                let additionalRestrictedCollections: string[] = [];

                if (hasLength(state.discoveredCollections)) {
                    additionalRestrictedCollections =
                        state.discoveredCollections.filter((collection) => {
                            const bindingUUIDs = state.bindings[collection];

                            return (
                                bindingUUIDs.some((uuid) =>
                                    Object.hasOwn(state.resourceConfigs, uuid)
                                ) &&
                                !state.restrictedDiscoveredCollections.includes(
                                    collection
                                )
                            );
                        });
                } else if (
                    workflow === 'capture_edit' &&
                    hasLength(collections)
                ) {
                    const nativeCollections = collections.filter((collection) =>
                        collection.includes(taskName)
                    );

                    additionalRestrictedCollections = nativeCollections.filter(
                        (collection) =>
                            Object.hasOwn(state.resourceConfigs, collection) &&
                            !state.restrictedDiscoveredCollections.includes(
                                collection
                            )
                    );
                }

                state.restrictedDiscoveredCollections = [
                    ...state.restrictedDiscoveredCollections,
                    ...additionalRestrictedCollections,
                ];
            }),
            false,
            'Multiple bindings removed'
        );
    },

    removeDiscoveredBindings: () => {
        set(
            produce((state: BindingState) => {
                if (
                    !isEmpty(state.bindings) &&
                    hasLength(state.discoveredCollections)
                ) {
                    // Remove discovered bindings from the bindings dictionary.
                    const reducedBindings = omit(
                        state.bindings,
                        state.discoveredCollections
                    );

                    state.bindings = reducedBindings;
                    state.bindingErrorsExist = isEmpty(reducedBindings);

                    // Remove the resource configs of discovered bindings from the resource config dictionary.
                    const mappedBindingUUIDs =
                        Object.values(reducedBindings).flat();

                    const reducedResourceConfigs = hasLength(mappedBindingUUIDs)
                        ? pick(state.resourceConfigs, mappedBindingUUIDs)
                        : {};

                    state.resourceConfigs = reducedResourceConfigs;
                    populateResourceConfigErrors(state, reducedResourceConfigs);

                    // Update the value of the current binding.
                    const evaluatedBindingUUID = mappedBindingUUIDs.at(0);

                    state.currentBinding = evaluatedBindingUUID
                        ? {
                              uuid: evaluatedBindingUUID,
                              collection:
                                  reducedResourceConfigs[evaluatedBindingUUID]
                                      .meta.collectionName,
                          }
                        : null;
                }
            }),
            false,
            'Discovered bindings removed'
        );
    },

    resetRediscoverySettings: () => {
        set(
            produce((state: BindingState) => {
                state.rediscoveryRequired = false;
                state.collectionsRequiringRediscovery = [];
            }),
            false,
            'Rediscovery Related Settings Reset'
        );
    },

    resetState: (keepCollections) => {
        const currentState = get();

        const initState = keepCollections
            ? getInitialStateData()
            : getInitialStoreData();

        const newState = {
            ...currentState,
            ...initState,
        };

        set(newState, false, 'Binding State Reset');
    },

    setBackfilledCollections: (increment, targetCollection) => {
        set(
            produce((state: BindingState) => {
                const existingCollections = state.getCollections();

                const collections: string[] = targetCollection
                    ? [targetCollection]
                    : existingCollections;

                state.backfilledCollections =
                    increment === 'true'
                        ? union(state.backfilledCollections, collections)
                        : state.backfilledCollections.filter(
                              (collection) => !collections.includes(collection)
                          );

                state.backfillAllBindings =
                    hasLength(existingCollections) &&
                    existingCollections.length ===
                        state.backfilledCollections.length;
            }),
            false,
            'Backfilled Collections Set'
        );
    },

    setCurrentBinding: (bindingUUID) => {
        set(
            produce((state: BindingState) => {
                const binding: BindingMetadata | null =
                    bindingUUID &&
                    Object.hasOwn(state.resourceConfigs, bindingUUID)
                        ? {
                              uuid: bindingUUID,
                              collection:
                                  state.resourceConfigs[bindingUUID].meta
                                      .collectionName,
                          }
                        : null;

                state.currentBinding = binding ?? null;
            }),
            false,
            'Current binding changed'
        );
    },

    setResourceConfig: (
        targetCollections,
        targetBindingUUID,
        value,
        disableCheckingErrors,
        disableOmit
    ) => {
        set(
            produce((state: BindingState) => {
                const collections = state.getCollections();

                if (typeof targetCollections === 'string') {
                    const bindingUUID =
                        targetBindingUUID ?? crypto.randomUUID();

                    state.resourceConfigs[bindingUUID] = value ?? {
                        ...createJSONFormDefaults(state.resourceSchema),
                        meta: {
                            collectionName: targetCollections,
                            bindingIndex:
                                Object.keys(state.resourceConfigs).length - 1,
                        },
                    };

                    if (!targetBindingUUID) {
                        initializeBinding(
                            state,
                            targetCollections,
                            bindingUUID
                        );
                    }

                    if (!disableCheckingErrors) {
                        populateResourceConfigErrors(
                            state,
                            state.resourceConfigs
                        );

                        state.bindingErrorsExist = isEmpty(targetCollections);
                    }
                } else {
                    const [removedCollections, newCollections] = whatChanged(
                        state.bindings,
                        state.resourceConfigs,
                        targetCollections
                    );

                    // Remove any configs that are no longer needed unless disabled.
                    //   We disable for the new collection selection pop up where the user
                    //   is always adding collections and can only remove them manually in
                    //   the list
                    const reducedResourceConfig = disableOmit
                        ? state.resourceConfigs
                        : omitBy(state.resourceConfigs, (config) =>
                              removedCollections.includes(
                                  config.meta.collectionName
                              )
                          );

                    // Update the config
                    state.resourceConfigs = reducedResourceConfig;

                    // Set defaults on new configs
                    const reducedBindingCount = Object.keys(
                        reducedResourceConfig
                    ).length;

                    newCollections.forEach((collectionName, index) => {
                        const bindingUUID = crypto.randomUUID();

                        initializeBinding(state, collectionName, bindingUUID);

                        state.resourceConfigs[bindingUUID] = {
                            ...createJSONFormDefaults(
                                state.resourceSchema,
                                collectionName
                            ),
                            meta: {
                                collectionName,
                                bindingIndex: reducedBindingCount + index,
                            },
                        };
                    });

                    // If previous state had no collections set to first
                    // If selected item is removed set to first.
                    // If adding new ones set to last
                    const bindingUUIDs = Object.keys(state.resourceConfigs);

                    const selectedBindingUUID =
                        collections.length === 0 ||
                        (state.currentBinding &&
                            !has(
                                state.resourceConfigs,
                                state.currentBinding.uuid
                            ))
                            ? bindingUUIDs[0]
                            : bindingUUIDs[bindingUUIDs.length - 1];

                    state.currentBinding = {
                        uuid: selectedBindingUUID,
                        collection:
                            state.resourceConfigs[selectedBindingUUID].meta
                                .collectionName,
                    };

                    // Update the collections with the new array
                    state.bindingErrorsExist = isEmpty(bindingUUIDs);

                    // See if the recently updated configs have errors
                    populateResourceConfigErrors(state, reducedResourceConfig);
                }
            }),
            false,
            'Resource Config Changed'
        );
    },

    setResourceSchema: (value) => {
        set(
            produce((state: BindingState) => {
                state.resourceSchema = value;
            }),
            false,
            'Resource Schema Set'
        );
    },

    setRestrictedDiscoveredCollections: (value, nativeCollectionFlag) => {
        set(
            produce((state: BindingState) => {
                let restrictedCollections: string[] =
                    state.restrictedDiscoveredCollections;

                if (state.restrictedDiscoveredCollections.includes(value)) {
                    restrictedCollections =
                        state.restrictedDiscoveredCollections.filter(
                            (collection) => collection !== value
                        );
                } else if (
                    state.discoveredCollections.includes(value) ||
                    nativeCollectionFlag
                ) {
                    restrictedCollections = [
                        value,
                        ...state.restrictedDiscoveredCollections,
                    ];
                }

                state.restrictedDiscoveredCollections = restrictedCollections;
            }),
            false,
            'Restricted Discovered Collections Set'
        );
    },

    setServerUpdateRequired: (value) => {
        set(
            produce((state: BindingState) => {
                state.serverUpdateRequired = value;
            }),
            false,
            'Server Update Required Flag Changed'
        );
    },

    toggleDisable: (targetUUIDs, value) => {
        // Updating a single item
        // A specific list (toggle page)
        // Nothing specified (toggle all)
        const evaluatedUUIDs =
            typeof targetUUIDs === 'string'
                ? [targetUUIDs]
                : Array.isArray(targetUUIDs)
                ? targetUUIDs
                : Object.keys(get().resourceConfigs);

        let updatedCount = 0;

        if (evaluatedUUIDs.length > 0) {
            set(
                produce((state: BindingState) => {
                    evaluatedUUIDs.forEach((uuid) => {
                        const { collectionName, disable, previouslyDisabled } =
                            state.resourceConfigs[uuid].meta;

                        const currValue = isBoolean(disable) ? disable : false;
                        const evaluatedFlag = value ?? !currValue;

                        if (value !== currValue) {
                            updatedCount = updatedCount + 1;
                        }

                        if (evaluatedFlag) {
                            state.resourceConfigs[uuid].meta.disable =
                                evaluatedFlag;

                            const existingIndex =
                                state.collectionsRequiringRediscovery.findIndex(
                                    (collectionRequiringRediscovery) =>
                                        collectionRequiringRediscovery ===
                                        collectionName
                                );
                            if (existingIndex > -1) {
                                state.collectionsRequiringRediscovery.splice(
                                    existingIndex,
                                    1
                                );

                                state.rediscoveryRequired = hasLength(
                                    state.collectionsRequiringRediscovery
                                );
                            }
                        } else {
                            delete state.resourceConfigs[uuid].meta.disable;

                            if (previouslyDisabled) {
                                state.collectionsRequiringRediscovery.push(
                                    collectionName
                                );

                                state.rediscoveryRequired = true;
                            }
                        }
                    });
                }),
                false,
                'Binding Disable Flag Toggled'
            );
        }

        // Return how many we updated
        return updatedCount;
    },

    updateResourceConfig: (targetCollection, targetBindingUUID, value) => {
        const { resourceConfigs, setResourceConfig } = get();

        // This was never empty in my testing but wanted to be safe
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const existingConfig = resourceConfigs[targetBindingUUID] ?? {};

        const formattedValue: ResourceConfig = {
            ...value,
            meta: {
                collectionName: targetCollection,
                bindingIndex:
                    resourceConfigs[targetBindingUUID].meta.bindingIndex,
            },
        };

        const updatedConfig = {
            ...existingConfig,
            ...formattedValue,
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
            setResourceConfig(
                targetCollection,
                targetBindingUUID,
                updatedConfig
            );
        }
    },
});

export const bindingStore = create<BindingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingStoreNames.GENERAL)
    )
);
