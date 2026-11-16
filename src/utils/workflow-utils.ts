import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { LiveSpecsExtQueryWithSpec } from 'src/hooks/useLiveSpecsExt';
import type { FullSourceDictionary } from 'src/stores/Binding/slices/TimeTravel';
import type { ResourceConfig } from 'src/stores/Binding/types';
import type { Entity, Schema } from 'src/types';
import type {
    BuiltBinding,
    BuiltCollection,
    BuiltSpec,
} from 'src/types/schemaModels';

import { isEmpty, isEqual, omit } from 'lodash';

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

export const getBuiltCollection = (
    builtSpec: BuiltSpec | null | undefined,
    binding: BuiltBinding | null | undefined
): BuiltCollection | undefined => {
    if (!builtSpec || !binding) {
        return undefined;
    }

    // A nonempty table selects indexed references, even if an inline collection exists.
    if (builtSpec.linkedCollections?.length) {
        const index = binding.collectionIndex ?? 0;

        return Number.isInteger(index) && index >= 0
            ? builtSpec.linkedCollections[index]
            : undefined;
    }

    return binding.collection;
};

export const getBindingIndexByResourcePath = (
    resourcePath: string[] | undefined,
    schema: Schema | null | undefined
): number => {
    if (!Array.isArray(resourcePath) || resourcePath.length === 0) {
        return -1;
    }

    return findUniqueIndex(schema?.bindings ?? [], (binding: Schema) =>
        isEqual(
            binding.resourcePath ?? binding.resource?._meta?.path,
            resourcePath
        )
    );
};

export const getBindingCorrespondence = (
    resourceConfig: Pick<ResourceConfig, 'data' | 'meta'> | undefined,
    draft:
        | Pick<DraftSpecQuery, 'spec' | 'built_spec' | 'validated'>
        | null
        | undefined,
    live?: Pick<LiveSpecsExtQueryWithSpec, 'spec' | 'built_spec'> | null
) => {
    const indices = {
        builtBindingIndex: -1,
        liveBindingIndex: -1,
        liveBuiltBindingIndex: -1,
        validatedBindingIndex: -1,
    };

    if (!resourceConfig || resourceConfig.meta.disable || !draft) {
        return indices;
    }

    const { collectionName } = resourceConfig.meta;
    const draftedIndex = getDraftedBindingIndex(resourceConfig, draft.spec);
    if (draftedIndex === -1) {
        return indices;
    }
    const resource = withoutResourceMetadata(
        draft.spec.bindings[draftedIndex].resource
    );

    const builtBindings: Schema[] = draft.built_spec?.bindings ?? [];
    indices.builtBindingIndex = findUniqueIndex(
        builtBindings,
        (binding) =>
            getBuiltCollection(draft.built_spec, binding)?.name ===
                collectionName &&
            Object.hasOwn(binding, 'resourceConfig') &&
            isEqual(binding.resourceConfig, resource)
    );

    const resourcePath = builtBindings[indices.builtBindingIndex]?.resourcePath;
    if (
        getBindingIndexByResourcePath(resourcePath, draft.built_spec) !==
        indices.builtBindingIndex
    ) {
        indices.builtBindingIndex = -1;
        return indices;
    }
    indices.validatedBindingIndex = getBindingIndexByResourcePath(
        resourcePath,
        draft.validated
    );

    if (indices.validatedBindingIndex > -1) {
        indices.liveBuiltBindingIndex = getBindingIndexByResourcePath(
            resourcePath,
            live?.built_spec
        );
        indices.liveBindingIndex = getBindingIndexByResourcePath(
            resourcePath,
            live?.spec
        );
    }

    return indices;
};

export const getDraftedBindingIndex = (
    resourceConfig: Pick<ResourceConfig, 'data' | 'meta'> | undefined,
    spec: Schema | null | undefined
): number => {
    if (
        !resourceConfig ||
        resourceConfig.meta.added === true ||
        !resourceConfig.meta.draftedResource
    ) {
        return -1;
    }

    const { bindingIndex, collectionName, disable, draftedResource } =
        resourceConfig.meta;
    const resource = withoutResourceMetadata(draftedResource);
    const authoredIndex = findUniqueIndex(
        spec?.bindings ?? [],
        (binding: Schema) =>
            !binding.disable === !disable &&
            getCollectionName(binding) === collectionName &&
            Object.hasOwn(binding, 'resource') &&
            isEqual(withoutResourceMetadata(binding.resource), resource)
    );

    // A different authored index requires rehydration; local edits must not select another binding.
    return authoredIndex === bindingIndex ? authoredIndex : -1;
};

const withoutResourceMetadata = (resource: unknown) =>
    resource && typeof resource === 'object' && !Array.isArray(resource)
        ? omit(resource, '_meta')
        : resource;

const findUniqueIndex = <T>(
    values: T[],
    matches: (value: T) => boolean
): number => {
    let matchedIndex = -1;
    for (let index = 0; index < values.length; index++) {
        if (matches(values[index])) {
            if (matchedIndex !== -1) {
                return -1;
            }
            matchedIndex = index;
        }
    }
    return matchedIndex;
};
