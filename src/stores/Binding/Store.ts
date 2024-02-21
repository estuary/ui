import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsById_writesTo,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { difference, has, intersection, isEqual, omit, orderBy } from 'lodash';
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
import { getCollectionName, getDisableProps } from 'utils/workflow-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
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

const getResourceConfig = (binding: any): ResourceConfig => {
    const { resource, disable } = binding;

    const collectionName = getCollectionName(binding);
    const disableProp = getDisableProps(disable);

    // Take the binding resource and place into config OR
    // generate a default in case there are any issues with it
    return {
        data: resource,
        errors: [],
        meta: { ...disableProp, collectionName },
    };
};

// TODO (optimization): Use this function in the ported over resource config store action, evaluateDiscoveredCollections.
const initializeResourceConfig = (
    state: BindingState,
    binding: any,
    bindingUUID: string
) => {
    const config = getResourceConfig(binding);

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
    'bindings' | 'currentBinding'
> => ({
    bindings: {},
    currentBinding: null,
});

const getInitialStateData = (): Pick<
    BindingState,
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceConfigs'
    | 'resourceSchema'
> => ({
    resourceConfigErrorsExist: false,
    resourceConfigErrors: [],
    resourceConfigs: {},
    resourceSchema: {},
});

const getInitialStoreData = () => ({
    ...getInitialBindingData(),
    ...getInitialStateData(),
    ...getInitialHydrationData(),
});

const getInitialState = (
    set: NamedSet<BindingState>,
    get: StoreApi<BindingState>['getState']
): BindingState => ({
    ...getInitialStoreData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

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
                    ([collectionName, bindingUUIDs]) => {
                        bindingUUIDs.forEach((bindingUUID) => {
                            // Rehydrating wipe out all configs and start again
                            // Not rehydrating then we should allow the current config to stand
                            //  and only populate the ones that are missing
                            modifiedResourceConfigs[bindingUUID] =
                                // Should not happen often but being safe with the resourceConfigs check here
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                Boolean(
                                    !rehydrating &&
                                        state.resourceConfigs[bindingUUID]
                                )
                                    ? state.resourceConfigs[bindingUUID]
                                    : {
                                          ...createJSONFormDefaults(
                                              state.resourceSchema,
                                              collectionName
                                          ),
                                          meta: { collectionName },
                                      };
                        });
                    }
                );

                state.resourceConfigs = modifiedResourceConfigs;
                populateResourceConfigErrors(state, modifiedResourceConfigs);
                initializeCurrentBinding(state, modifiedResourceConfigs);
            }),
            false,
            'Empty bindings added'
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

    prefillBindingDependentState: (bindings, _referenceBindings) => {
        set(
            produce((state: BindingState) => {
                bindings.forEach((binding) => {
                    const collection = getCollectionName(binding);
                    const UUID = crypto.randomUUID();

                    initializeBinding(state, collection, UUID);
                    initializeResourceConfig(state, binding, UUID);
                });

                populateResourceConfigErrors(state, state.resourceConfigs);
                initializeCurrentBinding(state, state.resourceConfigs);
            }),
            false,
            'Binding dependent state prefilled'
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
                }
            }),
            false,
            'Binding Removed'
        );
    },

    resetState: (keepCollections) => {
        const currentState = get();

        const initState = keepCollections
            ? getInitialBindingData()
            : getInitialStoreData();

        const newState = {
            ...currentState,
            ...initState,
        };

        set(newState, false, 'Binding State Reset');
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
                        meta: { collectionName: targetCollections },
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

                        // state.collectionErrorsExist = isEmpty(targetCollections);
                    }
                } else {
                    const [removedCollections, newCollections] = whatChanged(
                        state.bindings,
                        state.resourceConfigs,
                        targetCollections
                    );

                    // Set defaults on new configs
                    newCollections.forEach((collectionName) => {
                        const bindingUUID = crypto.randomUUID();

                        initializeBinding(state, collectionName, bindingUUID);

                        state.resourceConfigs[bindingUUID] = {
                            ...createJSONFormDefaults(
                                state.resourceSchema,
                                collectionName
                            ),
                            meta: { collectionName },
                        };
                    });

                    // Remove any configs that are no longer needed unless disabled.
                    //   We disable for the new collection selection pop up where the user
                    //   is always adding collections and can only remove them manually in
                    //   the list
                    const newResourceConfig = disableOmit
                        ? state.resourceConfigs
                        : omit(state.resourceConfigs, removedCollections);

                    const newConfigKeyList = Object.keys(newResourceConfig);

                    // Update the config
                    state.resourceConfigs = newResourceConfig;

                    // If previous state had no collections set to first
                    // If selected item is removed set to first.
                    // If adding new ones set to last
                    const selectedBindingUUID =
                        collections.length === 0 ||
                        (state.currentBinding &&
                            !has(
                                state.resourceConfigs,
                                state.currentBinding.uuid
                            ))
                            ? newConfigKeyList[0]
                            : newConfigKeyList[newConfigKeyList.length - 1];

                    state.currentBinding = {
                        uuid: selectedBindingUUID,
                        collection:
                            state.resourceConfigs[selectedBindingUUID].meta
                                .collectionName,
                    };

                    // Update the collections with the new array
                    // state.collections = newConfigKeyList;
                    // state.collectionErrorsExist = isEmpty(newConfigKeyList);

                    // See if the recently updated configs have errors
                    populateResourceConfigErrors(state, newResourceConfig);
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

    updateResourceConfig: (targetCollection, targetBindingUUID, value) => {
        const { resourceConfigs, setResourceConfig } = get();

        // This was never empty in my testing but wanted to be safe
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const existingConfig = resourceConfigs[targetBindingUUID] ?? {};

        const formattedValue: ResourceConfig = {
            ...value,
            meta: { collectionName: targetCollection },
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
