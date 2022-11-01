import {
    getLiveSpecsByLastPubId,
    getLiveSpecsByLiveSpecId,
    getSchema_Resource,
} from 'api/hydration';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { Schema } from 'types';
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

    hydrateState: async (workflow) => {
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

        if (workflow === 'materialization_create') {
            const specType = 'capture';

            if (lastPubId) {
                const { data, error } = await getLiveSpecsByLastPubId(
                    lastPubId,
                    specType
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
                    specType
                );

                if (error) {
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const { preFillEmptyCollections } = get();

                    preFillEmptyCollections(data);
                }
            }
        } else if (workflow === 'materialization_edit' && liveSpecId) {
            const { data, error } = await getLiveSpecsByLiveSpecId(
                liveSpecId,
                'materialization'
            );

            if (error) {
                setHydrationErrorsExist(true);
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
