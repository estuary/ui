import type { ConnectorConfig } from 'deps/flow/flow';
import type {
    CaptureDraftSpec,
    MaterializationsDraftSpec,
} from 'src/hooks/drafts/useGetDraftSpec';
import type { FullSourceDictionary } from 'src/stores/Binding/slices/TimeTravel';
import type {
    Bindings,
    ResourceConfig,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type {
    DekafConfig,
    EntityWithCreateWorkflow,
    Schema,
    SourceCaptureDef,
    TargetNamingModel,
    TargetNamingStrategy,
} from 'src/types';

import { useMemo } from 'react';

import { cloneDeep, isEmpty, omit } from 'lodash';

import { isDekafEndpointConfig } from 'src/utils/connector-utils';
import {
    addOrRemoveOnIncompatibleSchemaChange,
    addOrRemoveSourceCapture,
    addOrRemoveTargetNaming,
    getSourceCapturePropKey,
    setFieldsStanzaRecommended,
} from 'src/utils/entity-utils';
import {
    getBindingIndex,
    getCollectionName,
    getCollectionNameProp,
    getDisableProps,
    getFullSourceSetting,
    NEW_TASK_PUBLICATION_ID,
} from 'src/utils/workflow-utils';

const NEW_CAPTURE_AUTO_DISCOVER = {
    addNewBindings: true,
    evolveIncompatibleCollections: true,
};

// The task-level settings a draft spec is generated with.
// An omitted option is removed from the spec, not kept from
// the drafted one.
interface TaskSpecOptions {
    fullSource?: FullSourceDictionary | null;
    sourceCaptureDefinition?: SourceCaptureDef | null;
    specOnIncompatibleSchemaChange?: string;
    defaultFieldsRecommended?: boolean;
    targetNamingModel?: TargetNamingModel;
    targetNamingStrategy?: TargetNamingStrategy | null;
}

export function useGenerateDraftSpec(
    catalogType: 'capture'
): typeof generateCaptureDraftSpec;
export function useGenerateDraftSpec(
    catalogType: 'materialization'
): typeof generateMaterializationDraftSpec;

export function useGenerateDraftSpec(catalogType: EntityWithCreateWorkflow) {
    return useMemo(() => {
        switch (catalogType) {
            case 'capture':
                return generateCaptureDraftSpec;
            case 'materialization':
                return generateMaterializationDraftSpec;
        }
    }, [catalogType]);
}

function generateCaptureDraftSpec(
    existingDraftSpec: CaptureDraftSpec | null,
    endpointConfig: ConnectorConfig,
    resourceConfigs: ResourceConfigDictionary,
    bindings: Bindings
): CaptureDraftSpec {
    let spec = generateTaskSpec(
        'capture',
        existingDraftSpec?.spec,
        endpointConfig,
        resourceConfigs,
        bindings
    );

    // TODO: The discover executor applies starter defaults (autoDiscover,
    // expect_pub_id) only to an undrafted capture. GraphQL createDiscover reads
    // the endpoint from the draft, so we must draft the capture first, which
    // skips them. Consider having the createDiscover mutation apply them to a
    // drafted capture with no live spec, then remove this.
    if (!existingDraftSpec) {
        spec = { autoDiscover: NEW_CAPTURE_AUTO_DISCOVER, ...spec };
    }

    return {
        expect_pub_id: getExpectPubId(existingDraftSpec),
        spec,
    };
}

function generateMaterializationDraftSpec(
    existingDraftSpec: MaterializationsDraftSpec | null,
    endpointConfig: ConnectorConfig | DekafConfig,
    resourceConfigs: ResourceConfigDictionary,
    bindings: Bindings,
    options?: TaskSpecOptions
): MaterializationsDraftSpec {
    const spec = generateTaskSpec(
        'materialization',
        existingDraftSpec?.spec,
        endpointConfig,
        resourceConfigs,
        bindings,
        options
    );

    return {
        expect_pub_id: getExpectPubId(existingDraftSpec),
        spec,
    };
}

// Keep the drafted precondition, or expect no live spec for a new task
function getExpectPubId(
    existingDraftSpec: CaptureDraftSpec | MaterializationsDraftSpec | null
) {
    return existingDraftSpec
        ? existingDraftSpec.expect_pub_id
        : NEW_TASK_PUBLICATION_ID;
}

// Use the binding's index while it still points at its collection, and
// otherwise find it by name
function findDraftedBindingIndex(
    draftedBindings: any[],
    resourceConfigMeta: ResourceConfig['meta'],
    iteratedIndex: number
) {
    const { bindingIndex, collectionName } = resourceConfigMeta;
    const indexedBinding = draftedBindings[bindingIndex];

    return indexedBinding &&
        getCollectionName(indexedBinding) === collectionName
        ? bindingIndex
        : getBindingIndex(draftedBindings, collectionName, iteratedIndex);
}

// A copy of `generateTaskSpec` in `src/utils/workflow-utils`, which it will
// replace once its callers move to this hook. It matches each binding to its
// drafted binding by itself, rather than all by index or all by name.
//
// TODO (typing): Narrow the return type for this function.
function generateTaskSpec(
    catalogType: EntityWithCreateWorkflow,
    existingSpec: any,
    // Must be sops-encrypted, as it's written to the draft as-is
    endpointConfig: ConnectorConfig | DekafConfig,
    resourceConfigs: ResourceConfigDictionary,
    bindings: Bindings,
    options: TaskSpecOptions = {}
) {
    // Cloned so the drafted spec passed in isn't changed
    const draftSpec = existingSpec
        ? cloneDeep(existingSpec)
        : { bindings: [], endpoint: {} };

    const endpointProp = isDekafEndpointConfig(endpointConfig)
        ? 'dekaf'
        : 'connector';
    draftSpec.endpoint = { [endpointProp]: endpointConfig };

    if (isEmpty(resourceConfigs) || isEmpty(bindings)) {
        draftSpec.bindings = [];
    } else {
        const collectionNameProp = getCollectionNameProp(catalogType);
        const { fullSource = null, sourceCaptureDefinition = null } = options;

        Object.values(bindings).forEach((bindingUUIDs) => {
            bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                const { data: resourceConfig, meta } =
                    resourceConfigs[bindingUUID];

                const draftedIndex = findDraftedBindingIndex(
                    draftSpec.bindings,
                    meta,
                    iteratedIndex
                );
                const drafted = draftSpec.bindings[draftedIndex];

                // A binding that isn't drafted is only added with a resource config
                if (!drafted && isEmpty(resourceConfig)) {
                    return;
                }

                const disable = meta.disable === true;
                const collection = getFullSourceSetting(
                    fullSource,
                    meta.collectionName,
                    bindingUUID
                );

                let binding: Schema = drafted
                    ? { ...drafted }
                    : {
                          [collectionNameProp]: collection,
                          ...getDisableProps(disable),
                      };

                // Include disable otherwise totally remove it
                if (disable) {
                    binding.disable = disable;
                } else {
                    delete binding.disable;
                }

                binding.resource = { ...resourceConfig };
                binding[collectionNameProp] = collection;

                if (catalogType === 'materialization') {
                    addOrRemoveOnIncompatibleSchemaChange(
                        binding,
                        meta.onIncompatibleSchemaChange
                    );

                    // Remove the fields stanza from the drafted binding if it was reintroduced to the spec.
                    if (drafted && meta.added) {
                        binding = omit(binding, 'fields');
                    }

                    // Set the value of the recommended flag of a new binding to that of `fieldsRecommended`.
                    if (meta.liveBuiltBindingIndex === -1) {
                        setFieldsStanzaRecommended(
                            binding,
                            sourceCaptureDefinition
                        );
                    }
                }

                if (drafted) {
                    draftSpec.bindings[draftedIndex] = binding;
                } else {
                    draftSpec.bindings.push(binding);
                }
            });
        });

        const boundCollections = Object.keys(bindings);

        draftSpec.bindings = draftSpec.bindings.filter((binding: any) =>
            boundCollections.includes(
                getCollectionName(binding[collectionNameProp])
            )
        );
    }

    // Try adding at the end because these settings could be added/changed at any time
    if (catalogType === 'materialization') {
        // rootTargetNaming uses spec.targetNaming at the root; source.targetNaming must never
        // coexist with it. Strip targetNaming from the source capture def to enforce this.
        const { sourceCaptureDefinition = null } = options;
        const sourceCapture =
            options.targetNamingModel === 'rootTargetNaming' &&
            sourceCaptureDefinition
                ? omit(sourceCaptureDefinition, 'targetNaming')
                : sourceCaptureDefinition;

        addOrRemoveSourceCapture(draftSpec, sourceCapture);
        addOrRemoveTargetNaming(draftSpec, options.targetNamingStrategy);
        addOrRemoveOnIncompatibleSchemaChange(
            draftSpec,
            options.specOnIncompatibleSchemaChange
        );

        if (options.defaultFieldsRecommended) {
            const targetSourceProperty = getSourceCapturePropKey(draftSpec);

            draftSpec[targetSourceProperty] ??= {};
            draftSpec[targetSourceProperty].fieldsRecommended = 1;
        }
    }

    return draftSpec;
}
