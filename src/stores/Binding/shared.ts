import { difference, intersection } from 'lodash';
import { populateErrors } from 'stores/utils';
import { getCollectionName, getDisableProps } from 'utils/workflow-utils';
import {
    Bindings,
    BindingState,
    CollectionMetadata,
    ResourceConfig,
    ResourceConfigDictionary,
} from './types';

// Used to mark fields that should be removed during generation. This is
//      only here because if we set something to null and then check for nulls
//      we might end up overwritting a value a user specifically wants a null for.
export const REMOVE_DURING_GENERATION = undefined;

export const getCollections = (configs: ResourceConfigDictionary) => {
    return Object.values(configs);
};

export const getCollectionNames = (configs: ResourceConfigDictionary) => {
    return getCollections(configs).map(({ meta }) => meta.collectionName);
};

export const getEnabledCollectionNames = (
    configs: ResourceConfigDictionary
) => {
    return getCollections(configs)
        .filter(({ meta }) => !meta.disable)
        .map(({ meta }) => meta.collectionName);
};

export const populateResourceConfigErrors = (
    state: BindingState,
    resourceConfigs: ResourceConfigDictionary
): void => {
    const { configErrors, hasErrors } = populateErrors(resourceConfigs);

    state.resourceConfigErrors = configErrors;
    state.resourceConfigErrorsExist = hasErrors;
};

export const sortByDisableStatus = (
    disabledA: boolean,
    disabledB: boolean,
    collectionA: string,
    collectionB: string,
    ascendingSort: boolean
) => {
    // If a is enabled and b is disabled then return <0 to put a first
    if (!disabledA && disabledB) {
        return -1;
    }

    // If a is disabled and b is enabled then return >0 to put b first
    if (disabledA && !disabledB) {
        return 1;
    }

    return ascendingSort
        ? collectionA.localeCompare(collectionB)
        : collectionB.localeCompare(collectionA);
};

export const sortResourceConfigs = (
    resourceConfigs: ResourceConfigDictionary
) => {
    const sortedResources: ResourceConfigDictionary = {};

    Object.entries(resourceConfigs)
        .sort(([_uuidA, configA], [_uuidB, configB]) => {
            const { disable: disabledA, collectionName: collectionA } =
                configA.meta;
            const { disable: disabledB, collectionName: collectionB } =
                configB.meta;

            return sortByDisableStatus(
                disabledA ?? false,
                disabledB ?? false,
                collectionA,
                collectionB,
                true
            );
        })
        .forEach(([uuid, config]) => {
            sortedResources[uuid] = config;
        });

    return sortedResources;
};

export const updateCollectionMetadata = (
    state: BindingState,
    collection: string,
    metadata: CollectionMetadata
) => {
    if (Object.keys(state.collectionMetadata).includes(collection)) {
        Object.entries(metadata).forEach(([property, value]) => {
            state.collectionMetadata[collection][property] = value;
        });

        return;
    }

    state.collectionMetadata[collection] = metadata;
};

export const initializeBinding = (
    state: BindingState,
    collection: string,
    bindingUUID: string
) => {
    let existingBindingUUIDs: string[] = [];

    if (Object.hasOwn(state.bindings, collection)) {
        existingBindingUUIDs = state.bindings[collection];
    }

    state.bindings[collection] = existingBindingUUIDs.concat(bindingUUID);
};

export const initializeCurrentBinding = (
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

export const getResourceConfig = (
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
        meta: {
            ...disableProp,
            collectionName,
            bindingIndex,
            onIncompatibleSchemaChange: binding?.onIncompatibleSchemaChange,
        },
    };
};

export const initializeResourceConfig = (
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

export const whatChanged = (
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

export const initializeAndGenerateUUID = (
    state: BindingState,
    binding: any,
    index: number
) => {
    const collection = getCollectionName(binding);
    const UUID = crypto.randomUUID();

    initializeBinding(state, collection, UUID);
    initializeResourceConfig(state, binding, UUID, index);

    return {
        collection,
        UUID,
    };
};
