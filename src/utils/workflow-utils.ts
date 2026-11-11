import type { FullSourceDictionary } from 'src/stores/Binding/slices/TimeTravel';
import type { Entity, Schema } from 'src/types';
import type {
    MaterializationBuiltBinding,
    SpecDef,
} from 'src/types/schemaModels';

import { isEmpty, isEqual } from 'lodash';

import { getEndpointFromSpecDef } from 'src/utils/connector-utils';
import { isEncryptedConfig } from 'src/utils/sops-utils';

// This is the soft limit we recommend to users
export const MAX_BINDINGS = 300;
export const DEFAULT_DEBOUNCE_WAIT = 500;
export const QUICK_DEBOUNCE_WAIT = DEFAULT_DEBOUNCE_WAIT / 2;
export const NEAR_INSTANT_DEBOUNCE_WAIT = QUICK_DEBOUNCE_WAIT / 2;
export const NEW_TASK_PUBLICATION_ID = '00:00:00:00:00:00:00:00';

export const getBackfillCounter = (binding: any): number => {
    return Object.hasOwn(binding, 'backfill') ? binding.backfill : 0;
};

export const getSourceOrTarget = (binding: any) => {
    return Object.hasOwn(binding ?? {}, 'source')
        ? binding.source
        : Object.hasOwn(binding ?? {}, 'target')
          ? binding.target
          : binding;
};

export const getCollectionNameProp = (entityType: Entity) => {
    return entityType === 'materialization' ? 'source' : 'target';
};

const getCollectionNameDirectly = (binding: any) => {
    // Check if we're dealing with a FullSource or just a string
    return Object.hasOwn(binding ?? {}, 'name') ? binding.name : binding;
};

export const getCollectionName = (binding: any) => {
    // First see if we've already been passed a scoped binding
    //  or if we need to find the proper scope ourselves.
    const scopedBinding = getSourceOrTarget(binding);

    return getCollectionNameDirectly(scopedBinding);
};

const isValidIndex = (index: number) => index > -1;

export const getBindingIndex = (
    existingBindings: any[],
    collectionName: string,
    stagedBindingIndex: number
) => {
    const matchedCollectionIndices = existingBindings
        .map((binding: any, index) => {
            if (getCollectionName(binding) === collectionName) {
                return index;
            } else {
                return -1;
            }
        })
        .filter(isValidIndex);

    if (matchedCollectionIndices.length === 1) {
        return matchedCollectionIndices[0];
    } else if (
        stagedBindingIndex > -1 &&
        matchedCollectionIndices.length > stagedBindingIndex
    ) {
        return matchedCollectionIndices[stagedBindingIndex];
    } else {
        return -1;
    }
};

export const getDisableProps = (disable: boolean | undefined) => {
    return disable ? { disable } : {};
};

// Used to mark fields that should be removed during generation. This is
//      only here because if we set something to null and then check for nulls
//      we might end up overwritting a value a user specifically wants a null for.
export const REMOVE_DURING_GENERATION = undefined;

export const getFullSourceSetting = (
    fullSource: FullSourceDictionary | null,
    collectionName: string,
    bindingUUID: string
) => {
    const fullSourceConfig = fullSource?.[bindingUUID]?.data;

    return !isEmpty(fullSourceConfig)
        ? { ...fullSourceConfig, name: collectionName }
        : collectionName;
};

export const getBuiltBindingIndex = (
    builtSpec: Schema,
    targetCollection: string
): number => {
    const builtBindings: MaterializationBuiltBinding[] =
        builtSpec.bindings ?? [];

    return builtBindings.findIndex(
        (binding) => binding.collection.name === targetCollection
    );
};

export const getBindingIndexByResourcePath = <T extends Schema>(
    resourcePath: string[],
    schema: Schema
): number => {
    if (resourcePath.length === 0) {
        return -1;
    }

    const bindings: T[] = schema.bindings;

    return bindings.findIndex((binding) => {
        let bindingResourcePath: string[] = [];

        if (binding?.resourcePath) {
            bindingResourcePath = binding.resourcePath;
        } else if (binding?.resource?._meta?.path) {
            bindingResourcePath = binding.resource._meta.path;
        }

        return bindingResourcePath.length > 0
            ? isEqual(bindingResourcePath, resourcePath)
            : false;
    });
};

const UNSUPPORTED_CONFIG = new Error(
    'Only connector or dekaf configurations are supported'
);
const UNENCRYPTED_CONFIG = new Error(
    'The endpoint config must be encrypted before it is saved'
);

// A spec can only be drafted with a connector or Dekaf config encrypted with sops
export const validateEndpointConfig = (specDef: SpecDef): Error | null => {
    const endpoint = getEndpointFromSpecDef(specDef);
    if (!endpoint?.config) {
        return UNSUPPORTED_CONFIG;
    }
    if (!isEncryptedConfig(endpoint.config)) {
        return UNENCRYPTED_CONFIG;
    }

    return null;
};
