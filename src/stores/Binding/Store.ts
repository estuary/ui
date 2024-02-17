import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import {
    getLiveSpecsById_writesTo,
    getLiveSpecsByLiveSpecId,
} from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { difference, orderBy } from 'lodash';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { BindingStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { getCollectionName } from 'utils/workflow-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { BindingState, Bindings } from './types';

const STORE_KEY = 'Bindings';

const getCollections = (bindings: Bindings): string[] => Object.keys(bindings);

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

const getInitialStateData = () => ({
    ...getInitialBindingData(),
    ...getInitialHydrationData(),
});

const getInitialState = (
    set: NamedSet<BindingState>,
    get: StoreApi<BindingState>['getState']
): BindingState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

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
                });
            }),
            false,
            'Binding dependent state prefilled'
        );
    },

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

                // Filter out any collections that are not in the emptyCollections list
                // const modifiedCollections = hasLength(collections)
                //     ? union(collections, emptyCollections)
                //     : emptyCollections;

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
            }),
            false,
            'Empty bindings added'
        );
    },

    hydrateState: async (editWorkflow, entityType, rehydrating) => {
        const searchParams = new URLSearchParams(window.location.search);
        // const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
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

        // if (connectorId) {
        //     const { data, error } = await getSchema_Resource(connectorId);

        //     if (error) {
        //         setHydrationErrorsExist(true);
        //     } else if (data && data.length > 0) {
        //         const { setResourceSchema } = get();

        //         setResourceSchema(
        //             data[0].resource_spec_schema as unknown as Schema
        //         );
        //     }
        // }

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
            // Prefills bindings in the materialization create workflow when the Materialize CTA
            // on the Captures page or Details page is clicked.
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

    resetState: (keepCollections) => {
        const currentState = get();

        const initState = keepCollections
            ? getInitialBindingData()
            : getInitialStateData();

        const newState = {
            ...currentState,
            ...initState,
        };

        set(newState, false, 'Binding State Reset');
    },
});

export const bindingStore = create<BindingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions(BindingStoreNames.GENERAL)
    )
);
