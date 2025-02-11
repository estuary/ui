import { PostgrestError } from '@supabase/postgrest-js';
import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsById_writesTo,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { isBeforeTrialInterval } from 'components/materialization/shared';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { evaluateTrialCollections } from 'hooks/trialStorage/useTrialCollections';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import {
    difference,
    has,
    isBoolean,
    isEmpty,
    isEqual,
    omit,
    omitBy,
    pick,
    union,
} from 'lodash';
import {
    createJSONFormDefaults,
    getResourceConfigPointers,
} from 'services/ajv';
import { logRocketEvent } from 'services/shared';
import { BASE_ERROR } from 'services/supabase';
import { CustomEvents } from 'services/types';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BindingStoreNames } from 'stores/names';
import { Entity, Schema } from 'types';
import { getDereffedSchema, hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { formatCaptureInterval, parsePostgresInterval } from 'utils/time-utils';
import { getBackfillCounter, getBindingIndex } from 'utils/workflow-utils';
import { POSTGRES_INTERVAL_RE } from 'validation';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import {
    getCollectionNames,
    initializeAndGenerateUUID,
    initializeBinding,
    initializeCurrentBinding,
    populateResourceConfigErrors,
    sortResourceConfigs,
    whatChanged,
} from './shared';
import {
    getInitialFieldSelectionData,
    getStoreWithFieldSelectionSettings,
} from './slices/FieldSelection';
import {
    getInitialTimeTravelData,
    getStoreWithTimeTravelSettings,
    initializeFullSourceConfig,
} from './slices/TimeTravel';
import { BindingMetadata, BindingState, ResourceConfig } from './types';

const STORE_KEY = 'Bindings';

const hydrateConnectorTagDependentState = async (
    connectorTagId: string,
    get: StoreApi<BindingState>['getState']
): Promise<Schema | null> => {
    if (!hasLength(connectorTagId)) {
        return null;
    }

    const { data, error } = await getSchema_Resource(connectorTagId);

    if (error) {
        get().setHydrationErrorsExist(true);
    } else if (data?.resource_spec_schema) {
        const schema = data.resource_spec_schema as unknown as Schema;
        await get().setResourceSchema(schema);

        get().setBackfillSupported(!Boolean(data.disable_backfill));
    }

    return data;
};

const hydrateSpecificationDependentState = async (
    defaultInterval: string | null | undefined,
    entityType: Entity,
    fallbackInterval: string | null,
    get: StoreApi<BindingState>['getState'],
    getTrialOnlyPrefixes: (prefixes: string[]) => Promise<string[]>,
    liveSpec: LiveSpecsExtQuery['spec'],
    searchParams: URLSearchParams
): Promise<PostgrestError | null> => {
    const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);

    if (draftId) {
        const { data: draftSpecs, error } = await getDraftSpecsByDraftId(
            draftId,
            entityType
        );

        if (error || !draftSpecs || draftSpecs.length === 0) {
            return (
                error ?? {
                    ...BASE_ERROR,
                    message: `An issue was encountered fetching the drafted specification for this ${entityType}`,
                }
            );
        }

        get().prefillBindingDependentState(
            entityType,
            liveSpec.bindings,
            draftSpecs[0].spec.bindings
        );

        const targetInterval = draftSpecs[0].spec?.interval;

        get().setCaptureInterval(
            targetInterval
                ? formatCaptureInterval(targetInterval)
                : fallbackInterval,
            defaultInterval
        );

        get().setSpecOnIncompatibleSchemaChange(
            draftSpecs[0].spec?.onIncompatibleSchemaChange
        );
    } else {
        get().prefillBindingDependentState(entityType, liveSpec.bindings);

        get().setCaptureInterval(
            liveSpec?.interval ?? fallbackInterval,
            defaultInterval
        );

        get().setSpecOnIncompatibleSchemaChange(
            liveSpec?.onIncompatibleSchemaChange
        );
    }

    const trialCollections = await evaluateTrialCollections(
        Object.keys(get().bindings),
        getTrialOnlyPrefixes,
        []
    );

    get().setCollectionMetadata(trialCollections);

    return null;
};

const getInitialBindingData = (): Pick<
    BindingState,
    'bindingErrorsExist' | 'bindings' | 'currentBinding'
> => ({
    bindingErrorsExist: false,
    bindings: {},
    currentBinding: null,
});

const getInitialMiscData = (): Pick<
    BindingState,
    | 'backfilledBindings'
    | 'backfillAllBindings'
    | 'backfillDataFlow'
    | 'backfillDataFlowTarget'
    | 'backfillSupported'
    | 'captureInterval'
    | 'collectionsRequiringRediscovery'
    | 'defaultCaptureInterval'
    | 'discoveredCollections'
    | 'evolvedCollections'
    | 'onIncompatibleSchemaChange'
    | 'onIncompatibleSchemaChangeErrorExists'
    | 'rediscoveryRequired'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceConfigs'
    | 'resourceSchema'
    | 'restrictedDiscoveredCollections'
    | 'serverUpdateRequired'
    | 'sourceCaptureDeltaUpdatesSupported'
    | 'sourceCaptureTargetSchemaSupported'
> => ({
    backfillAllBindings: false,
    backfillDataFlowTarget: null,
    backfillDataFlow: false,
    backfillSupported: true,
    backfilledBindings: [],
    captureInterval: null,
    collectionsRequiringRediscovery: [],
    defaultCaptureInterval: null,
    discoveredCollections: [],
    evolvedCollections: [],
    onIncompatibleSchemaChange: undefined,
    onIncompatibleSchemaChangeErrorExists: {
        binding: false,
        spec: false,
    },
    rediscoveryRequired: false,
    resourceConfigErrorsExist: false,
    resourceConfigErrors: [],
    resourceConfigs: {},
    resourceSchema: {},
    restrictedDiscoveredCollections: [],
    serverUpdateRequired: false,
    sourceCaptureDeltaUpdatesSupported: false,
    sourceCaptureTargetSchemaSupported: false,
});

const getInitialStoreData = () => ({
    ...getInitialBindingData(),
    ...getInitialFieldSelectionData(),
    ...getInitialHydrationData(),
    ...getInitialMiscData(),
    ...getInitialTimeTravelData(),
});

const getInitialState = (
    set: NamedSet<BindingState>,
    get: StoreApi<BindingState>['getState']
): BindingState => ({
    ...getInitialStoreData(),
    ...getStoreWithFieldSelectionSettings(set),
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithTimeTravelSettings(set),

    addEmptyBindings: (data, rehydrating) => {
        set(
            produce((state: BindingState) => {
                const collections = getCollectionNames(state.resourceConfigs);

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

                const sortedResourceConfigs = sortResourceConfigs(
                    modifiedResourceConfigs
                );

                state.resourceConfigs = sortedResourceConfigs;
                populateResourceConfigErrors(state, sortedResourceConfigs);

                state.bindingErrorsExist = isEmpty(state.bindings);
                initializeCurrentBinding(state, sortedResourceConfigs);
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

                state.rediscoveryRequired = false;
                state.collectionsRequiringRediscovery = [];

                state.backfilledBindings = [];
                state.backfillAllBindings = false;

                // TODO (perf) - we could probably go ahead and figure out the sort
                //  while also going through and initializing but I am really tired right now

                // Go through the discovered bindings BEFORE sorting so that
                //  we know the original indexs of all the bindings.
                state.resourceConfigs = {};
                draftSpecResponse.data[0].spec.bindings.forEach(
                    (binding: any, index: number) => {
                        initializeAndGenerateUUID(state, binding, index);
                    }
                );

                // Now that we have gone through the initialized everything we are safe to sort
                state.resourceConfigs = sortResourceConfigs(
                    state.resourceConfigs
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

    hydrateState: async (
        editWorkflow,
        entityType,
        connectorTagId,
        getTrialOnlyPrefixes,
        rehydrating
    ) => {
        const searchParams = new URLSearchParams(window.location.search);
        const prefillLiveSpecIds = searchParams.getAll(
            GlobalSearchParams.PREFILL_LIVE_SPEC_ID
        );
        const liveSpecIds = searchParams.getAll(
            GlobalSearchParams.LIVE_SPEC_ID
        );
        const materializationHydrating = entityType === 'materialization';
        const materializationRehydrating =
            materializationHydrating && rehydrating;

        get().resetState(materializationRehydrating);

        const connectorTagResponse = await hydrateConnectorTagDependentState(
            connectorTagId,
            get
        );

        const fallbackInterval =
            entityType === 'capture' &&
            typeof connectorTagResponse?.default_capture_interval === 'string'
                ? ''
                : null;

        if (editWorkflow && liveSpecIds.length > 0) {
            const { data: liveSpecs, error: liveSpecError } =
                await getLiveSpecsByLiveSpecId(liveSpecIds[0], entityType);

            if (liveSpecError || !liveSpecs || liveSpecs.length === 0) {
                get().setHydrationErrorsExist(true);

                return Promise.reject(
                    liveSpecError?.message ??
                        `An issue was encountered fetching the live specification for this ${entityType}`
                );
            }

            const draftSpecError = await hydrateSpecificationDependentState(
                connectorTagResponse?.default_capture_interval,
                entityType,
                fallbackInterval,
                get,
                getTrialOnlyPrefixes,
                liveSpecs[0].spec,
                searchParams
            );

            if (draftSpecError) {
                get().setHydrationErrorsExist(true);

                return Promise.reject(draftSpecError.message);
            }
        } else {
            get().setCaptureInterval(
                fallbackInterval,
                connectorTagResponse?.default_capture_interval
            );
        }

        if (prefillLiveSpecIds.length > 0) {
            // Prefills bindings in materialization workflows when the Materialize CTA
            // on the Captures page, Collections page, or captures/collections Details page is clicked.
            const { data, error } = await getLiveSpecsById_writesTo(
                prefillLiveSpecIds
            );

            if (error) {
                get().setHydrationErrorsExist(true);
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

    prefillBindingDependentState: (
        entityType,
        liveBindings,
        draftedBindings,
        rehydrating
    ) => {
        set(
            produce((state: BindingState) => {
                const bindings = draftedBindings ?? liveBindings;

                if (rehydrating) {
                    state.bindings = {};
                    state.resourceConfigs = {};
                }

                bindings.forEach((binding, index) => {
                    const { UUID, collection } = initializeAndGenerateUUID(
                        state,
                        binding,
                        index
                    );

                    if (entityType === 'materialization') {
                        initializeFullSourceConfig(state, binding, UUID);
                    }

                    if (draftedBindings && !rehydrating) {
                        // Prefill backfilled collections
                        const draftedBackfillCounter =
                            getBackfillCounter(binding);

                        const targetBindingIndex = Object.hasOwn(
                            state.bindings,
                            collection
                        )
                            ? state.bindings[collection].findIndex(
                                  (uuid) => uuid === UUID
                              )
                            : -1;

                        const liveBindingIndex = getBindingIndex(
                            liveBindings,
                            collection,
                            targetBindingIndex
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
                            state.backfilledBindings.push(UUID);
                        }
                    }
                });

                const sortedResourceConfigs = sortResourceConfigs(
                    state.resourceConfigs
                );

                state.resourceConfigs = sortedResourceConfigs;
                populateResourceConfigErrors(state, sortedResourceConfigs);

                state.bindingErrorsExist = isEmpty(state.bindings);
                initializeCurrentBinding(state, sortedResourceConfigs);
            }),
            false,
            'Binding dependent state prefilled'
        );
    },

    prefillResourceConfigs: (targetCollections, disableOmit, trackAddition) => {
        set(
            produce((state: BindingState) => {
                const collections = getCollectionNames(state.resourceConfigs);

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

                    const jsonFormDefaults = createJSONFormDefaults(
                        state.resourceSchema,
                        collectionName
                    );

                    // TODO (web flow wasm - source capture)
                    //  Will want to merge / update / something with WASM here into the defaultConfig.data
                    //  once we add the ability in WASM AND we wire up the ability for a user to make
                    //  mass changes to their binding settings here

                    state.resourceConfigs[bindingUUID] = {
                        ...jsonFormDefaults,
                        meta: {
                            added: trackAddition,
                            bindingIndex: reducedBindingCount + index,
                            collectionName,
                        },
                    };
                });

                // If previous state had no collections set to first
                // If selected item is removed set to first.
                // If adding new ones set to last
                state.resourceConfigs = sortResourceConfigs(
                    state.resourceConfigs
                );
                const bindingUUIDs = Object.keys(state.resourceConfigs);

                const selectedBindingUUID =
                    collections.length === 0 ||
                    (state.currentBinding &&
                        !has(state.resourceConfigs, state.currentBinding.uuid))
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
            }),
            false,
            'Resource Config Prefilled'
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

                    // Only update the current binding if we have removed the one that is currently selected
                    if (state.currentBinding?.uuid === uuid) {
                        state.currentBinding = Boolean(
                            evaluatedBindingUUID && evaluatedResourceConfig
                        )
                            ? {
                                  uuid: evaluatedBindingUUID,
                                  collection:
                                      evaluatedResourceConfig.meta
                                          .collectionName,
                              }
                            : null;
                    }

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
                const collections = getCollectionNames(state.resourceConfigs);

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

    // The `hydrated` state property can only be set when the `active` state property is true.
    // An external, hydration component is responsible for setting the `active` state property
    // to true when hydration is initiated and false once completed. Consequently, this property
    // value should be preserved by default when the `resetState` action is called.
    resetState: (keepCollections, resetActive) => {
        const { active, ...currentState } = get();

        const initState = keepCollections
            ? {
                  ...getInitialFieldSelectionData(),
                  ...getInitialMiscData(),
                  ...getInitialTimeTravelData(),
              }
            : getInitialStoreData();

        const newState = {
            ...currentState,
            ...initState,
            active: resetActive ? false : active,
        };

        set(newState, false, 'Binding State Reset');
    },

    setBackfilledBindings: (increment, targetBindingUUID) => {
        set(
            produce((state: BindingState) => {
                const existingBindingUUIDs = Object.keys(state.resourceConfigs);

                const bindingUUIDs = targetBindingUUID
                    ? [targetBindingUUID]
                    : existingBindingUUIDs;

                state.backfilledBindings =
                    increment === 'true'
                        ? union(state.backfilledBindings, bindingUUIDs)
                        : state.backfilledBindings.filter(
                              (uuid) => !bindingUUIDs.includes(uuid)
                          );

                state.backfillAllBindings =
                    hasLength(existingBindingUUIDs) &&
                    existingBindingUUIDs.length ===
                        state.backfilledBindings.length;
            }),
            false,
            'Backfilled Collections Set'
        );
    },

    setBindingOnIncompatibleSchemaChange: (value, bindingUUID) => {
        set(
            produce((state: BindingState) => {
                if (bindingUUID) {
                    state.resourceConfigs[
                        bindingUUID
                    ].meta.onIncompatibleSchemaChange = value;
                }
            }),
            false,
            'Binding Incompatible Schema Change Set'
        );
    },

    setCaptureInterval: (value, defaultInterval) => {
        set(
            produce((state: BindingState) => {
                if (
                    defaultInterval &&
                    POSTGRES_INTERVAL_RE.test(defaultInterval)
                ) {
                    state.defaultCaptureInterval = parsePostgresInterval(
                        defaultInterval,
                        true
                    );
                }

                state.captureInterval = value;
            }),
            false,
            'Capture interval set'
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
                state.searchQuery = null;
            }),
            false,
            'Current binding changed'
        );
    },

    setOnIncompatibleSchemaChangeErrorExists: (value, key) => {
        set(
            produce((state: BindingState) => {
                state.onIncompatibleSchemaChangeErrorExists[key] = value;
            }),
            false,
            'On Incompatible Schema Change Error Exists Set'
        );
    },

    setResourceSchema: async (val) => {
        const resolved = await getDereffedSchema(val);

        set(
            produce((state: BindingState) => {
                if (!resolved) {
                    state.setHydrationErrorsExist(true);
                    return;
                }

                state.resourceSchema = resolved;

                // TODO (web flow wasm - source capture - possible perf improvement)
                //  Us calling `getResourceConfigPointers` here means we end up going
                //   through the schema multiple times. Once here and twice when we go through
                //   it to generate a UI schema. That does NOT set anything in a store and probably
                //   should never set anything in a store directly.
                //  Might not be a huge deal to do this twice but something to think about.
                const pointers = getResourceConfigPointers(resolved);
                state.sourceCaptureDeltaUpdatesSupported = Boolean(
                    pointers['x-delta-updates']
                );
                state.sourceCaptureTargetSchemaSupported = Boolean(
                    pointers['x-schema-name']
                );
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

    setCollectionMetadata: (values) => {
        if (!hasLength(values)) {
            return;
        }

        set(
            produce((state: BindingState) => {
                values.forEach(({ catalog_name, updated_at }) => {
                    state.bindings[catalog_name].forEach((uuid) => {
                        const triggered =
                            state.backfilledBindings.includes(uuid) ||
                            state.resourceConfigs[uuid].meta.added;

                        state.resourceConfigs[uuid].meta = {
                            ...state.resourceConfigs[uuid].meta,
                            sourceBackfillRecommended:
                                triggered && isBeforeTrialInterval(updated_at),
                            trialOnlyStorage: true,
                            updatedAt: updated_at,
                        };
                    });
                });
            }),
            false,
            'Trial Only Storage Set'
        );
    },

    setSpecOnIncompatibleSchemaChange: (value) => {
        set(
            produce((state: BindingState) => {
                state.onIncompatibleSchemaChange = value;
            }),
            false,
            'Specification Incompatible Schema Change Set'
        );
    },

    // TODO (organization): Correct the location of store actions that are out-of-order.
    setBackfillDataFlow: (value) => {
        set(
            produce((state: BindingState) => {
                state.backfillDataFlow = value;
            }),
            false,
            'Backfill Dataflow Flag Changed'
        );
    },

    setBackfillDataFlowTarget: (value) => {
        set(
            produce((state: BindingState) => {
                state.backfillDataFlowTarget = value;
            }),
            false,
            'Backfill data flow target changed'
        );
    },

    setBackfillSupported: (value) => {
        set(
            produce((state: BindingState) => {
                state.backfillSupported = value;
            }),
            false,
            'Backfill supported changed'
        );
    },

    setEvolvedCollections: (value) => {
        set(
            produce((state: BindingState) => {
                state.evolvedCollections = value;
            }),
            false,
            'Evolved Collections List Set'
        );
    },

    toggleDisable: (targetUUIDs, value) => {
        let updatedCount = 0;

        set(
            produce((state: BindingState) => {
                // Updating a single item
                // A specific list (toggle page)
                // Nothing specified (toggle all)
                const evaluatedUUIDs: string[] =
                    typeof targetUUIDs === 'string'
                        ? [targetUUIDs]
                        : Array.isArray(targetUUIDs)
                        ? targetUUIDs
                        : Object.keys(state.resourceConfigs);

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

        // Return how many we updated
        return updatedCount;
    },

    updateResourceConfig: (
        targetCollection,
        targetBindingUUID,
        value,
        disableCheckingErrors
    ) => {
        set(
            produce((state: BindingState) => {
                // This was never empty in my testing but wanted to be safe
                const existingConfig: ResourceConfig | null = Object.hasOwn(
                    state.resourceConfigs,
                    targetBindingUUID
                )
                    ? state.resourceConfigs[targetBindingUUID]
                    : null;

                const targetResourceConfig =
                    state.resourceConfigs[targetBindingUUID];

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!targetResourceConfig) {
                    logRocketEvent(
                        CustomEvents.BINDINGS_RESOURCE_CONFIG_MISSING,
                        {
                            targetBindingUUID,
                            targetCollection,
                        }
                    );

                    return;
                }

                const evaluatedConfig: ResourceConfig = {
                    ...value,
                    meta: {
                        added: targetResourceConfig.meta.added,
                        bindingIndex: targetResourceConfig.meta.bindingIndex,
                        collectionName: targetCollection,
                        sourceBackfillRecommended:
                            targetResourceConfig.meta.sourceBackfillRecommended,
                        trialOnlyStorage:
                            targetResourceConfig.meta.trialOnlyStorage,
                        updatedAt: targetResourceConfig.meta.updatedAt,
                    },
                };

                if (!isEmpty(existingConfig)) {
                    const {
                        disable,
                        onIncompatibleSchemaChange,
                        previouslyDisabled,
                    } = existingConfig.meta;

                    evaluatedConfig.meta.disable = disable;
                    evaluatedConfig.meta.previouslyDisabled =
                        previouslyDisabled;

                    evaluatedConfig.meta.onIncompatibleSchemaChange =
                        onIncompatibleSchemaChange;
                }

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
                if (
                    existingConfig &&
                    !isEqual(existingConfig, evaluatedConfig)
                ) {
                    state.resourceConfigs[targetBindingUUID] = evaluatedConfig;

                    if (!targetBindingUUID) {
                        initializeBinding(
                            state,
                            targetCollection,
                            targetBindingUUID
                        );
                    }

                    if (!disableCheckingErrors) {
                        populateResourceConfigErrors(
                            state,
                            state.resourceConfigs
                        );

                        state.bindingErrorsExist = isEmpty(targetCollection);
                    }
                }
            }),
            false,
            'Resource Config Updated'
        );
    },
});

export const useBindingStore = create<BindingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingStoreNames.GENERAL)
    )
);
