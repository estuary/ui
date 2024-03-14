import { ConnectorTag_Base, ConnectorsQuery_DetailsForm } from 'api/connectors';
import {
    DraftSpecsExtQuery_ByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';
import {
    ConnectorTagWithDetailTags,
    ConnectorWithTagDetailQuery,
} from 'hooks/connectors/shared';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isBoolean, isEmpty } from 'lodash';
import { CallSupabaseResponse } from 'services/supabase';
import { REMOVE_DURING_GENERATION } from 'stores/Binding/shared';
import {
    FullSource,
    FullSourceDictionary,
} from 'stores/Binding/slices/TimeTravel';
import { Bindings, ResourceConfigDictionary } from 'stores/Binding/types';
import { Entity, EntityWithCreateWorkflow, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { ConnectorConfig } from '../../flow_deps/flow';

// This is the soft limit we recommend to users
export const MAX_BINDINGS = 300;

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

export const getBindingIndex = (
    existingBindings: any[] | null | undefined,
    collectionName: string,
    stagedBindingIndex: number
) => {
    const matchedCollectionIndices =
        existingBindings
            ?.map((binding: any, index) =>
                getCollectionName(binding) === collectionName ? index : -1
            )
            .filter((bindingIndex) => bindingIndex > -1) ?? [];

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

export const addOrRemoveSourceCapture = (
    draftSpec: any,
    sourceCapture: string | null
) => {
    if (sourceCapture) {
        draftSpec.sourceCapture = sourceCapture;
    } else {
        delete draftSpec.sourceCapture;
    }

    return draftSpec;
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
    connectorConfig: ConnectorConfig,
    resourceConfigs: ResourceConfigDictionary,
    resourceConfigServerUpdateRequired: boolean,
    bindings: Bindings,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
    options: {
        fullSource: FullSourceDictionary | null;
        sourceCapture: string | null;
    }
) => {
    const draftSpec = isEmpty(existingTaskData)
        ? {
              bindings: [],
              endpoint: {},
          }
        : existingTaskData.spec;

    draftSpec.endpoint.connector = connectorConfig;

    if (!isEmpty(resourceConfigs) && !isEmpty(bindings)) {
        const collectionNameProp = getCollectionNameProp(entityType);
        const { fullSource } = options;

        Object.entries(bindings).forEach(([_collection, bindingUUIDs]) => {
            bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                const resourceConfig = resourceConfigs[bindingUUID].data;

                const { bindingIndex, collectionName, disable } =
                    resourceConfigs[bindingUUID].meta;

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

                    draftSpec.bindings.push({
                        [collectionNameProp]: getFullSourceSetting(
                            fullSource,
                            collectionName,
                            bindingUUID
                        ),
                        ...disabledProps,
                        resource: {
                            ...resourceConfig,
                        },
                    });
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

    // Try adding at the end because this setting could be added/changed at any time
    if (entityType === 'materialization') {
        addOrRemoveSourceCapture(draftSpec, options.sourceCapture);
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
    catalogName: string;
    lastPubId: string;
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
        { fullSource: null, sourceCapture: null }
    );

    return modifyDraftSpec(draftSpec, {
        draft_id: draftId,
        spec_type: 'capture',
    });
};

// Common materialization field selection checks
export const evaluateRequiredIncludedFields = (
    constraintType: ConstraintTypes
): boolean => {
    return (
        constraintType === ConstraintTypes.FIELD_REQUIRED ||
        constraintType === ConstraintTypes.LOCATION_REQUIRED
    );
};

export const evaluateRecommendedIncludedFields = (
    constraintType: ConstraintTypes
): boolean => {
    const includeRequired = evaluateRequiredIncludedFields(constraintType);

    return (
        includeRequired ||
        constraintType === ConstraintTypes.LOCATION_RECOMMENDED
    );
};

export interface ConnectorVersionEvaluationOptions {
    connectorId: string;
    existingImageTag: string;
}

export function evaluateConnectorVersions(
    connector: ConnectorWithTagDetailQuery,
    options?: ConnectorVersionEvaluationOptions
): ConnectorTagWithDetailTags;
export function evaluateConnectorVersions(
    connector: ConnectorsQuery_DetailsForm,
    options?: ConnectorVersionEvaluationOptions
): ConnectorTag_Base;
export function evaluateConnectorVersions(
    connector: ConnectorWithTagDetailQuery | ConnectorsQuery_DetailsForm,
    options?: ConnectorVersionEvaluationOptions
): ConnectorTagWithDetailTags | ConnectorTag_Base {
    // Return the version of the connector that is used by the existing task in an edit workflow.
    if (options && options.connectorId === connector.id) {
        const connectorsInUse = connector.connector_tags.filter(
            (version) => version.image_tag === options.existingImageTag
        );

        if (hasLength(connectorsInUse)) {
            return connectorsInUse[0];
        }
    }

    // Return the latest version of a given connector.
    return connector.connector_tags.sort((a, b) =>
        b.image_tag.localeCompare(a.image_tag)
    )[0];
}
