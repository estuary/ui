import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsById_writesTo,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { difference, orderBy } from 'lodash';
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
    BindingState,
    Bindings,
    ResourceConfig,
    ResourceConfigDictionary,
} from './types';

const STORE_KEY = 'Bindings';

const getCollections = (bindings: Bindings): string[] => Object.keys(bindings);

const getResourceConfig = (binding: any): ResourceConfig => {
    const { resource, disable } = binding;

    const disableProp = getDisableProps(disable);

    // Take the binding resource and place into config OR
    // generate a default in case there are any issues with it
    return {
        data: resource,
        errors: [],
        meta: { ...disableProp },
    };
};

// TODO (optimization): Use this function in the ported over resource config store action, evaluateDiscoveredCollections.
const initializeResourceConfig = (
    state: BindingState,
    binding: any,
    bindingId: string
) => {
    const config = getResourceConfig(binding);

    state.resourceConfigs[bindingId] = config;

    if (config.meta.disable) {
        state.resourceConfigs[bindingId].meta.previouslyDisabled = true;
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

const getInitialBindingData = (): Pick<BindingState, 'bindings'> => ({
    bindings: {},
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
                const collections = getCollections(state.bindings);

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
                    ([collection, bindingIds]) => {
                        bindingIds.forEach((bindingId) => {
                            // Rehydrating wipe out all configs and start again
                            // Not rehydrating then we should allow the current config to stand
                            //  and only populate the ones that are missing
                            modifiedResourceConfigs[bindingId] =
                                // Should not happen often but being safe with the resourceConfigs check here
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                !rehydrating && state.resourceConfigs[bindingId]
                                    ? state.resourceConfigs[bindingId]
                                    : {
                                          ...createJSONFormDefaults(
                                              state.resourceSchema,
                                              collection
                                          ),
                                          meta: {},
                                      };
                        });
                    }
                );

                state.resourceConfigs = modifiedResourceConfigs;
                populateResourceConfigErrors(state, modifiedResourceConfigs);
            }),
            false,
            'Empty bindings added'
        );
    },

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

                    const existingBindingIds: string[] = Object.hasOwn(
                        state.bindings,
                        collection
                    )
                        ? state.bindings[collection]
                        : [];

                    state.bindings[collection] =
                        existingBindingIds.concat(UUID);

                    initializeResourceConfig(state, binding, UUID);
                });

                populateResourceConfigErrors(state, state.resourceConfigs);
            }),
            false,
            'Binding dependent state prefilled'
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

    setResourceSchema: (value) => {
        set(
            produce((state: BindingState) => {
                state.resourceSchema = value;
            }),
            false,
            'Resource Schema Set'
        );
    },
});

export const bindingStore = create<BindingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingStoreNames.GENERAL)
    )
);
