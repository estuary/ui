import {
    DraftSpecsExtQuery_ByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEmpty, isNull } from 'lodash';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import {
    AutoDiscoverySettings,
    Entity,
    EntityWithCreateWorkflow,
    Schema,
} from 'types';
import { hasLength } from 'utils/misc-utils';
import { ConnectorConfig } from '../../flow_deps/flow';

export const getCollectionNameProp = (entityType: Entity) => {
    return entityType === 'materialization' ? 'source' : 'target';
};

export const getCollectionName = (binding: any) => {
    // First see if we've already been passed a scoped binding
    //  or if we need to find the proper scope ourselves.
    const scopedBinding = Object.hasOwn(binding, 'source')
        ? binding.source
        : Object.hasOwn(binding, 'target')
        ? binding.target
        : binding;

    // Check if we're dealing with a FullSource or just a string
    return Object.hasOwn(scopedBinding, 'name')
        ? scopedBinding.name
        : scopedBinding;
};

// TODO (typing): Narrow the return type for this function.
export const generateTaskSpec = (
    entityType: EntityWithCreateWorkflow,
    connectorConfig: ConnectorConfig,
    resourceConfigs: ResourceConfigDictionary | null,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
    autoDiscoverySettings?: AutoDiscoverySettings,
    editWorkflow?: boolean
) => {
    const draftSpec = isEmpty(existingTaskData)
        ? {
              bindings: [],
              endpoint: {},
          }
        : existingTaskData.spec;

    draftSpec.endpoint.connector = connectorConfig;

    if (resourceConfigs) {
        const collectionNameProp = getCollectionNameProp(entityType);

        const boundCollectionNames = Object.keys(resourceConfigs);

        boundCollectionNames.forEach((collectionName) => {
            const resourceConfig = resourceConfigs[collectionName].data;

            const existingBindingIndex = draftSpec.bindings.findIndex(
                (binding: any) => getCollectionName(binding) === collectionName
            );

            if (existingBindingIndex > -1) {
                draftSpec.bindings[existingBindingIndex].resource = {
                    ...resourceConfig,
                };
            } else if (Object.keys(resourceConfig).length > 0) {
                draftSpec.bindings.push({
                    [collectionNameProp]: collectionName,
                    resource: {
                        ...resourceConfig,
                    },
                });
            }
        });

        if (hasLength(draftSpec.bindings)) {
            draftSpec.bindings = draftSpec.bindings.filter((binding: any) =>
                boundCollectionNames.includes(
                    getCollectionName(binding[collectionNameProp])
                )
            );
        }
    } else {
        draftSpec.bindings = [];
    }

    if (entityType === 'capture' && autoDiscoverySettings) {
        const truthySettingExists = Object.values(autoDiscoverySettings).some(
            (value) => value
        );

        const defaultSettings = editWorkflow ? null : {};

        if (Object.hasOwn(draftSpec, 'autoDiscover')) {
            draftSpec.autoDiscover = truthySettingExists
                ? autoDiscoverySettings
                : isEmpty(draftSpec.autoDiscover)
                ? {}
                : isNull(draftSpec.autoDiscover)
                ? null
                : defaultSettings;
        } else if (truthySettingExists) {
            draftSpec.autoDiscover = autoDiscoverySettings;
        }
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
    autoDiscoverySettings: AutoDiscoverySettings,
    editWorkflow: boolean
): Promise<CallSupabaseResponse<any>> => {
    const draftSpec = generateTaskSpec(
        'capture',
        { image: connectorImage, config: encryptedEndpointConfig },
        resourceConfig,
        existingTaskData,
        autoDiscoverySettings,
        editWorkflow
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
        constraintType === ConstraintTypes.LOCATION_RECOMMENDED ||
        constraintType === ConstraintTypes.FIELD_OPTIONAL
    );
};
