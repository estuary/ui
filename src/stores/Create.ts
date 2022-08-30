import { JsonFormsCore } from '@jsonforms/core';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { difference, has, isEmpty, isEqual, map, omit } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { MessagePrefixes } from 'types';
import { StoreApi } from 'zustand';
import { NamedSet } from 'zustand/middleware';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage?: {
            id: string;
            iconPath: string;
            imagePath: string;
            connectorId: string;
        };
    };
}

export interface JsonFormsData extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export interface ResourceConfig {
    errors: any[];
    [key: string]: JsonFormsData | any[];
}

const getDefaultJsonFormsData = () => ({
    data: {},
    errors: [],
});

const filterErrors = (
    list: ResourceConfig['errors'] | Details['errors'] | JsonFormsData['errors']
) => {
    return map(list, 'message');
};

const fetchErrors = ({ errors }: any) => {
    let response: any[] = [];

    if (errors && errors.length > 0) {
        response = response.concat(errors);
    }

    return response;
};

const whatChanged = (
    key: CreateEntityStore['collections'],
    resourceConfig: ResourceConfig
) => {
    const newResourceKey = key;
    const currentCollections = Object.keys(resourceConfig);
    const removedCollections = difference(
        currentCollections,
        newResourceKey ?? []
    );
    const newCollections = difference(newResourceKey, currentCollections);

    return [removedCollections, newCollections];
};

const populateHasErrors = (
    get: any,
    state: any,
    configs: {
        resource?: any;
        endpoint?: any;
    },
    collections?: any,
    detailErrors?: any
) => {
    const { resource, endpoint } = configs;

    // We can just pull these since these values are updated when
    //  the config itself is updated
    const resourceConfigHasErrors = resource ?? get().resourceConfigHasErrors;
    const endpointConfigHasErrors = endpoint ?? get().endpointConfigHasErrors;

    state.collectionsHasErrors = isEmpty(collections ?? get().collections);
    state.detailsFormHasErrors = !isEmpty(detailErrors ?? get().details.errors);

    state.hasErrors = Boolean(
        state.collectionsHasErrors ||
            state.detailsFormHasErrors ||
            endpointConfigHasErrors ||
            resourceConfigHasErrors
    );

    state.displayValidation = state.hasErrors;
};

const populateEndpointConfigErrors = (
    endpointConfig: any,
    state: CreateEntityStore,
    get: StoreApi<CreateEntityStore>['getState']
) => {
    const endpointConfigErrors = filterErrors(fetchErrors(endpointConfig));
    state.endpointConfigErrors = endpointConfigErrors;
    state.endpointConfigHasErrors = !isEmpty(endpointConfigErrors);
    populateHasErrors(get, state, {
        endpoint: !isEmpty(endpointConfigErrors),
    });

    return !isEmpty(endpointConfigErrors);
};

const populateResourceConfigErrors = (
    resourceConfig: any,
    state: CreateEntityStore
) => {
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
    state.resourceConfigHasErrors = !isEmpty(resourceConfigErrors);

    return !isEmpty(resourceConfigErrors);
};

export interface CreateEntityStore {
    //Details
    details: Details;
    setDetails: (details: Details) => void;
    detailsFormHasErrors: boolean;

    //Spec
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;
    endpointConfigHasErrors: boolean;
    endpointConfigErrors: string[];

    // Resource Config
    resourceConfig: { [key: string]: ResourceConfig };
    setResourceConfig: (key: string | [string], value?: ResourceConfig) => void;
    resourceConfigHasErrors: boolean;
    resourceConfigErrors: string[];

    // Collection Selector
    collections: string[] | null;
    prefillCollections: (collections: LiveSpecsExtQuery[]) => void;
    collectionsHasErrors: boolean;
    currentCollection: string | null;
    setCurrentCollection: (collections: string) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: CreateEntityStore['connectors']) => void;
    endpointSchema: { [key: string]: any };
    setEndpointSchema: (val: CreateEntityStore['endpointSchema']) => void;
    resourceSchema: { [key: string]: any };
    setResourceSchema: (val: CreateEntityStore['resourceSchema']) => void;
    hasErrors: boolean;

    //Content
    messagePrefix: MessagePrefixes;

    resetState: () => void;
    hasChanges: () => boolean;
}

export const initialCreateStates = {
    collections: () => [],
    currentCollection: () => null,
    connectors: () => [],
    details: (): Details => {
        return {
            data: {
                connectorImage: {
                    connectorId: '',
                    id: '',
                    iconPath: '',
                    imagePath: '',
                },
                entityName: '',
            },
            errors: [],
        };
    },
    endpointSchema: () => {
        return {};
    },
    resourceSchema: () => {
        return {};
    },
    endpointConfig: (): JsonFormsData => {
        const defaults = getDefaultJsonFormsData();
        return { ...defaults };
    },
    resourceConfig: () => {
        return {};
    },
};

export const getInitialStateData = (
    includeCollections: boolean,
    messagePrefix: MessagePrefixes
): Pick<
    CreateEntityStore,
    | 'details'
    | 'endpointConfig'
    | 'endpointConfigErrors'
    | 'connectors'
    | 'endpointSchema'
    | 'resourceSchema'
    | 'collections'
    | 'currentCollection'
    | 'resourceConfig'
    | 'resourceConfigErrors'
    | 'messagePrefix'
    | 'resourceConfigHasErrors'
    | 'endpointConfigHasErrors'
    | 'detailsFormHasErrors'
    | 'collectionsHasErrors'
    | 'hasErrors'
> => {
    return {
        hasErrors: true,

        messagePrefix,
        details: initialCreateStates.details(),
        detailsFormHasErrors: true,

        endpointConfig: initialCreateStates.endpointConfig(),
        endpointConfigHasErrors: true,
        endpointConfigErrors: [],

        connectors: initialCreateStates.connectors(),

        endpointSchema: initialCreateStates.endpointSchema(),
        resourceSchema: initialCreateStates.resourceSchema(),

        resourceConfig: initialCreateStates.resourceConfig(),
        resourceConfigErrors: [],
        resourceConfigHasErrors: true,

        collections: includeCollections
            ? initialCreateStates.collections()
            : null,
        currentCollection: initialCreateStates.currentCollection(),
        collectionsHasErrors: includeCollections, // This defaults to true because collections starts empty
    };
};

export const getInitialCreateState = (
    set: NamedSet<CreateEntityStore>,
    get: StoreApi<CreateEntityStore>['getState'],
    includeCollections: boolean,
    messagePrefix: MessagePrefixes
): CreateEntityStore => {
    const response: CreateEntityStore = {
        ...getInitialStateData(includeCollections, messagePrefix),
        setDetails: (details) => {
            set(
                produce((state) => {
                    if (!details.data.connectorImage) {
                        details.data.connectorImage =
                            initialCreateStates.details().data.connectorImage;
                        state.endpointConfig = {};
                    } else if (
                        state.details.data.connectorImage?.id !==
                        details.data.connectorImage.id
                    ) {
                        const { endpointConfig } = getInitialStateData(
                            includeCollections,
                            messagePrefix
                        );
                        state.endpointConfig = endpointConfig;
                        populateEndpointConfigErrors(
                            endpointConfig,
                            state,
                            get
                        );
                    }

                    state.details = details;

                    populateHasErrors(get, state, {}, null, details.errors);
                }),
                false,
                'Details changed'
            );
        },

        setEndpointConfig: (endpointConfig) => {
            set(
                produce((state) => {
                    state.endpointConfig = endpointConfig;
                    populateEndpointConfigErrors(endpointConfig, state, get);
                }),
                false,
                'Endpoint config changed'
            );
        },

        hasChanges: () => {
            const { details, endpointConfig, resourceConfig } = get();
            const {
                details: initialDetails,
                endpointConfig: initialEndpointConfig,
                resourceConfig: initialResourceConfig,
            } = getInitialStateData(includeCollections, messagePrefix);

            return !isEqual(
                {
                    details: details.data,
                    endpointConfig: endpointConfig.data,
                    resourceConfig: resourceConfig.data,
                },
                {
                    details: initialDetails.data,
                    endpointConfig: initialEndpointConfig.data,
                    resourceConfig: initialResourceConfig.data,
                }
            );
        },
        setConnectors: (val) => {
            set(
                produce((state) => {
                    state.connectors = val;
                }),
                false,
                'Caching connectors response'
            );
        },
        setEndpointSchema: (val) => {
            set(
                produce((state) => {
                    state.endpointSchema = val;
                }),
                false,
                'Setting endpointSchema'
            );
        },
        setResourceSchema: (val) => {
            set(
                produce((state) => {
                    state.resourceSchema = val;
                }),
                false,
                'Setting resourceSchema'
            );
        },
        setResourceConfig: (key, value) => {
            set(
                produce((state) => {
                    const { resourceSchema } = get();

                    if (typeof key === 'string') {
                        state.resourceConfig[key] =
                            value ?? createJSONFormDefaults(resourceSchema);

                        const hasErrors = populateResourceConfigErrors(
                            state.resourceConfig,
                            state
                        );
                        populateHasErrors(get, state, {
                            resource: hasErrors,
                        });
                    } else {
                        const newResourceKeyList = key;
                        const [removedCollections, newCollections] =
                            whatChanged(
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
                            state.collections.length === 0 ||
                            !has(state.resourceConfig, state.currentCollection)
                        ) {
                            state.currentCollection = newResourceKeyList[0];
                        } else {
                            state.currentCollection =
                                newResourceKeyList[
                                    newResourceKeyList.length - 1
                                ];
                        }

                        // Update the collections with the new array
                        state.collections = newResourceKeyList;

                        // See if the recently updated configs have errors
                        const hasErrors = populateResourceConfigErrors(
                            newResourceConfig,
                            state
                        );
                        populateHasErrors(
                            get,
                            state,
                            {
                                resource: hasErrors,
                            },
                            newResourceKeyList
                        );
                    }
                }),
                false,
                'Resource Config Changed'
            );
        },

        setCurrentCollection: (value) => {
            set(
                produce((state) => {
                    state.currentCollection = value;
                }),
                false,
                'Current Collection Changed'
            );
        },

        prefillCollections: (value) => {
            set(
                produce((state) => {
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
                    const hasErrors = populateResourceConfigErrors(
                        configs,
                        state
                    );
                    populateHasErrors(
                        get,
                        state,
                        {
                            resource: hasErrors,
                        },
                        collections
                    );
                }),
                false,
                'Collections Prefilled'
            );
        },

        resetState: () => {
            set(
                getInitialStateData(includeCollections, messagePrefix),
                false,
                'Resetting State'
            );
        },
    };

    return response;
};

export const entityCreateStoreSelectors = {
    details: {
        data: (state: CreateEntityStore) => state.details.data,
        entityName: (state: CreateEntityStore) => state.details.data.entityName,
        connectorTag: (state: CreateEntityStore) =>
            state.details.data.connectorImage,
        description: (state: CreateEntityStore) =>
            state.details.data.description,
        set: (state: CreateEntityStore) => state.setDetails,
        hasErrors: (state: CreateEntityStore) => state.detailsFormHasErrors,
    },
    endpointConfig: {
        id: (state: CreateEntityStore) => state.endpointConfig.data.id,
        data: (state: CreateEntityStore) => state.endpointConfig.data,
        set: (state: CreateEntityStore) => state.setEndpointConfig,
        errors: (state: CreateEntityStore) => state.endpointConfig.errors,
        hasErrors: (state: CreateEntityStore) => state.endpointConfigHasErrors,
    },
    resourceConfig: {
        get: (state: CreateEntityStore) => state.resourceConfig,
        set: (state: CreateEntityStore) => state.setResourceConfig,
        errors: (state: CreateEntityStore) => state.resourceConfigErrors,
        hasErrors: (state: CreateEntityStore) => state.resourceConfigHasErrors,
    },
    collections: {
        get: (state: CreateEntityStore) => state.collections,
        prefill: (state: CreateEntityStore) => state.prefillCollections,
        hasErrors: (state: CreateEntityStore) => state.collectionsHasErrors,
        current: {
            get: (state: CreateEntityStore) => state.currentCollection,
            set: (state: CreateEntityStore) => state.setCurrentCollection,
        },
    },

    connectors: (state: CreateEntityStore) => state.connectors,
    endpointSchema: (state: CreateEntityStore) => state.endpointSchema,
    setEndpointSchema: (state: CreateEntityStore) => state.setEndpointSchema,
    resourceSchema: (state: CreateEntityStore) => state.resourceSchema,
    setResourceSchema: (state: CreateEntityStore) => state.setResourceSchema,

    messagePrefix: (state: CreateEntityStore) => state.messagePrefix,

    resetState: (state: CreateEntityStore) => state.resetState,
    hasChanges: (state: CreateEntityStore) => state.hasChanges,
    hasErrors: (state: CreateEntityStore) => state.hasErrors,
};
