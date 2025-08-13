import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByCatalogName } from 'src/api/draftSpecs';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { CallSupabaseResponse } from 'src/services/supabase';
import type {
    FullSource,
    FullSourceDictionary,
} from 'src/stores/Binding/slices/TimeTravel';
import type {
    Bindings,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type {
    DekafConfig,
    Entity,
    EntityWithCreateWorkflow,
    Schema,
    SourceCaptureDef,
} from 'src/types';
import type {
    BuiltBinding,
    MaterializationBinding,
    ValidatedBinding,
} from 'src/types/schemaModels';

import { isBoolean, isEmpty, isEqual } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { isDekafEndpointConfig } from 'src/utils/connector-utils';
import {
    addOrRemoveOnIncompatibleSchemaChange,
    addOrRemoveSourceCapture,
} from 'src/utils/entity-utils';
import { hasLength } from 'src/utils/misc-utils';

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

export const getBindingAsFullSource = (binding: any) => {
    const response = getSourceOrTarget(binding);
    if (typeof response === 'string') {
        return {
            name: response,
        };
    }

    return getSourceOrTarget(binding);
};

export const getCollectionNameProp = (entityType: Entity) => {
    return entityType === 'materialization' ? 'source' : 'target';
};

export const getCollectionNameDirectly = (binding: any) => {
    // Check if we're dealing with a FullSource or just a string
    return Object.hasOwn(binding ?? {}, 'name') ? binding.name : binding;
};

export const getCollectionName = (binding: any) => {
    // First see if we've already been passed a scoped binding
    //  or if we need to find the proper scope ourselves.
    const scopedBinding = getSourceOrTarget(binding);

    return getCollectionNameDirectly(scopedBinding);
};

export const isValidIndex = (index: number) => index > -1;

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
export const getFullSource = (
    fullSource: FullSource | string | undefined,
    filterOutName?: boolean,
    filterOutRemovable?: boolean
): {
    fullSource?: FullSource;
} => {
    if (typeof fullSource === 'string' || fullSource === undefined) {
        return {};
    }

    const response = {
        fullSource: { ...fullSource },
    };

    if (filterOutName) {
        delete response.fullSource.name;
    }

    if (filterOutRemovable) {
        response.fullSource = Object.entries(response.fullSource).reduce(
            (filtered, [key, val]) => {
                if (val !== REMOVE_DURING_GENERATION) {
                    filtered[key] = val;
                }

                return filtered;
            },
            {}
        );
    }

    return response;
};

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

export const updateFullSource = () => {};

// TODO (typing): Narrow the return type for this function.
export const generateTaskSpec = (
    entityType: EntityWithCreateWorkflow,
    endpointConfig: ConnectorConfig | DekafConfig,
    resourceConfigs: ResourceConfigDictionary,
    resourceConfigServerUpdateRequired: boolean,
    bindings: Bindings,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
    options: {
        fullSource: FullSourceDictionary | null;
        sourceCaptureDefinition: SourceCaptureDef | null;
        specOnIncompatibleSchemaChange?: string;
    }
) => {
    const draftSpec = isEmpty(existingTaskData)
        ? {
              bindings: [],
              endpoint: {},
          }
        : existingTaskData.spec;

    const endpointProp = isDekafEndpointConfig(endpointConfig)
        ? 'dekaf'
        : 'connector';

    draftSpec.endpoint = { [endpointProp]: endpointConfig };

    if (!isEmpty(resourceConfigs) && !isEmpty(bindings)) {
        const collectionNameProp = getCollectionNameProp(entityType);
        const { fullSource } = options;

        Object.entries(bindings).forEach(([_collection, bindingUUIDs]) => {
            bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                const resourceConfig = resourceConfigs[bindingUUID].data;

                const {
                    bindingIndex,
                    collectionName,
                    disable,
                    onIncompatibleSchemaChange,
                } = resourceConfigs[bindingUUID].meta;

                // Check if disable is a boolean otherwise default to false
                const bindingDisabled = isBoolean(disable) ? disable : false;

                // See which binding we need to update
                const existingBindingIndex = resourceConfigServerUpdateRequired
                    ? getBindingIndex(
                          draftSpec.bindings,
                          collectionName,
                          iteratedIndex
                      )
                    : hasLength(draftSpec.bindings)
                      ? bindingIndex
                      : -1;

                if (existingBindingIndex > -1) {
                    // Include disable otherwise totally remove it
                    if (bindingDisabled) {
                        draftSpec.bindings[existingBindingIndex].disable =
                            bindingDisabled;
                    } else {
                        delete draftSpec.bindings[existingBindingIndex].disable;
                    }

                    if (entityType === 'materialization') {
                        addOrRemoveOnIncompatibleSchemaChange(
                            draftSpec.bindings[existingBindingIndex],
                            onIncompatibleSchemaChange
                        );
                    }

                    // Only update if there is a fullSource to populate. Otherwise just set the name.
                    //  This handles both captures that do not have these settings AND when
                    draftSpec.bindings[existingBindingIndex] = {
                        ...draftSpec.bindings[existingBindingIndex],
                        resource: {
                            ...resourceConfig,
                        },
                        [collectionNameProp]: getFullSourceSetting(
                            fullSource,
                            collectionName,
                            bindingUUID
                        ),
                    };
                } else if (Object.keys(resourceConfig).length > 0) {
                    const disabledProps = getDisableProps(bindingDisabled);

                    const newBinding: Schema = {
                        [collectionNameProp]: getFullSourceSetting(
                            fullSource,
                            collectionName,
                            bindingUUID
                        ),
                        ...disabledProps,
                        resource: {
                            ...resourceConfig,
                        },
                    };

                    if (entityType === 'materialization') {
                        addOrRemoveOnIncompatibleSchemaChange(
                            newBinding,
                            onIncompatibleSchemaChange
                        );
                    }

                    draftSpec.bindings.push(newBinding);
                }
            });
        });

        if (hasLength(draftSpec.bindings)) {
            const boundCollections = Object.keys(bindings);

            draftSpec.bindings = draftSpec.bindings.filter((binding: any) =>
                boundCollections.includes(
                    getCollectionName(binding[collectionNameProp])
                )
            );
        }
    } else {
        draftSpec.bindings = [];
    }

    // Try adding at the end because these settings could be added/changed at any time
    if (entityType === 'materialization') {
        addOrRemoveSourceCapture(draftSpec, options.sourceCaptureDefinition);
        addOrRemoveOnIncompatibleSchemaChange(
            draftSpec,
            options.specOnIncompatibleSchemaChange
        );
    }

    return draftSpec;
};

// const mergeResourceConfigs = (
//     queryData: DraftSpecQuery,
//     resourceConfig: ResourceConfigDictionary,
//     restrictedDiscoveredCollections: string[]
// ): ResourceConfigDictionary => {
//     const existingCollections = Object.keys(resourceConfig);
//     const mergedResourceConfig: ResourceConfigDictionary = {};

//     Object.entries(resourceConfig).forEach(([key, value]) => {
//         mergedResourceConfig[key] = value;
//     });

//     queryData.spec.bindings.forEach((binding: any) => {
//         if (
//             !existingCollections.includes(binding.target) &&
//             !restrictedDiscoveredCollections.includes(binding.target)
//         ) {
//             mergedResourceConfig[binding.target] = {
//                 data: binding.resource,
//                 errors: [],
//             };
//         }
//     });

//     return mergedResourceConfig;
// };

export interface SupabaseConfig {
    lastPubId: string;
    catalogName?: string;
}

export const modifyDiscoveredDraftSpec = async (
    response: {
        data: DraftSpecQuery[];
        error?: undefined;
    },
    supabaseConfig?: SupabaseConfig | null
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    return modifyDraftSpec(
        draftSpecData.spec,
        {
            draft_id: draftSpecData.draft_id,
            catalog_name: draftSpecData.catalog_name,
        },
        supabaseConfig?.catalogName,
        supabaseConfig?.lastPubId
    );
};

export const modifyExistingCaptureDraftSpec = async (
    draftId: string,
    connectorImage: string,
    encryptedEndpointConfig: Schema,
    resourceConfig: ResourceConfigDictionary,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
    resourceConfigServerUpdateRequired: boolean,
    bindings: Bindings
): Promise<CallSupabaseResponse<any>> => {
    const draftSpec = generateTaskSpec(
        'capture',
        { image: connectorImage, config: encryptedEndpointConfig },
        resourceConfig,
        resourceConfigServerUpdateRequired,
        bindings,
        existingTaskData,
        {
            fullSource: null,
            sourceCaptureDefinition: null,
        }
    );

    return modifyDraftSpec(draftSpec, {
        draft_id: draftId,
        spec_type: 'capture',
    });
};

export const getBuiltBindingIndex = (
    builtSpec: Schema,
    targetCollection: string
): number => {
    const builtBindings: BuiltBinding[] = builtSpec.bindings ?? [];

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

const getDraftedMaterializationBinding = (
    draftSpec: Schema,
    resourcePath: string[] | undefined,
    stagedBindingIndex: number,
    targetCollection: string,
    indexLookupOnly?: boolean
): {
    draftedBinding: MaterializationBinding | undefined;
    draftedBindingIndex: number;
} => {
    let draftedBinding: MaterializationBinding | undefined;
    let draftedBindingIndex = -1;

    // Attempt to identify the target drafted binding by resource path pointer(s) before
    // relying on the binding index.
    if (!indexLookupOnly && resourcePath) {
        draftedBindingIndex =
            getBindingIndexByResourcePath<MaterializationBinding>(
                resourcePath,
                draftSpec
            );

        draftedBinding = draftSpec.bindings.at(draftedBindingIndex);
    }

    if (!draftedBinding) {
        draftedBindingIndex = getBindingIndex(
            draftSpec.bindings,
            targetCollection,
            stagedBindingIndex
        );

        draftedBinding =
            draftedBindingIndex > -1
                ? draftSpec.bindings[draftedBindingIndex]
                : undefined;
    }

    return { draftedBinding, draftedBindingIndex };
};

interface BindingTypes<B, V, T> {
    built: B | undefined;
    drafted: T | undefined;
    live: T | undefined;
    validated: V | undefined;
}

export interface RelatedBindings {
    indices: BindingTypes<number, number, number>;
    values: BindingTypes<
        BuiltBinding,
        ValidatedBinding,
        MaterializationBinding
    >;
}

export const getRelatedBindings = (
    builtSpec: Schema,
    draftSpec: Schema,
    stagedBindingIndex: number,
    targetCollection: string,
    validationResponse: Schema,
    liveSpec?: Schema | null
): RelatedBindings => {
    // Select the binding from the built spec that corresponds to the current collection
    //  to extract the projection information.
    // Defaulting to empty array. This is to handle when a user has disabled a collection
    //  which causes the binding to not be included in the built_spec
    const builtBindingIndex = getBuiltBindingIndex(builtSpec, targetCollection);
    const builtBinding: BuiltBinding | undefined =
        builtSpec.bindings.at(builtBindingIndex);

    // The validation phase of a publication produces a document which correlates each binding projection
    // to a constraint type (defined in flow/go/protocols/materialize/materialize.proto). Select the binding
    // from the validation document that corresponds to the current collection to extract the constraint types.
    const validatedBindingIndex =
        getBindingIndexByResourcePath<ValidatedBinding>(
            builtBinding?.resourcePath ?? [],
            validationResponse
        );
    const validatedBinding: ValidatedBinding | undefined =
        validationResponse.bindings.at(validatedBindingIndex);

    // TODO (field-selection): Use the staged binding index to identify the target drafted binding for now.
    //   Determine whether resource path pointer can be used for drafted binding lookup.
    const { draftedBinding, draftedBindingIndex } =
        getDraftedMaterializationBinding(
            draftSpec,
            builtBinding?.resourcePath,
            stagedBindingIndex,
            targetCollection,
            true
        );

    const liveBindingIndex = liveSpec
        ? getBindingIndexByResourcePath<MaterializationBinding>(
              builtBinding?.resourcePath ?? [],
              liveSpec
          )
        : undefined;
    const liveBinding: MaterializationBinding | undefined =
        liveSpec?.bindings.at(liveBindingIndex);

    return {
        indices: {
            built: builtBindingIndex,
            drafted: draftedBindingIndex,
            live: liveBindingIndex,
            validated: validatedBindingIndex,
        },
        values: {
            built: builtBinding,
            drafted: draftedBinding,
            live: liveBinding,
            validated: validatedBinding,
        },
    };
};
