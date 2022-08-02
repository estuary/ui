import { ResourceConfigStoreNames } from 'context/Zustand';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { JsonFormsData, Schema } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface ResourceConfig {
    [key: string]: JsonFormsData | any[];
    errors: any[];
}

interface ResourceConfigDictionary {
    [key: string]: ResourceConfig;
}

// TODO: Determine whether the resourceConfig state property should be made plural. It is a dictionary of individual resource configs, so I am leaning "yes."
export interface ResourceConfigState {
    // Collection Selector
    collections: string[] | null;
    preFillCollections: (collections: LiveSpecsExtQuery[]) => void;

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
    | 'resourceConfig'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceSchema'
> => ({
    collections: [],
    collectionErrorsExist: true,
    currentCollection: null,
    resourceConfig: {},
    resourceConfigErrorsExist: true,
    resourceConfigErrors: [],
    resourceSchema: {},
});

const getInitialState = (
    set: NamedSet<ResourceConfigState>,
    get: StoreApi<ResourceConfigState>['getState']
): ResourceConfigState => ({
    ...getInitialStateData(),

    preFillCollections: (value) => {
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
            'Reset Schema Set'
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
