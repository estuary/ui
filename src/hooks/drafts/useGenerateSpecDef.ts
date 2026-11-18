import type {
    CaptureBinding,
    CaptureDef,
    ConnectorConfig,
    MaterializationBinding,
    MaterializationDef,
} from 'deps/flow/flow';
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
    getFullSourceSetting,
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

export function useGenerateSpecDef(
    catalogType: 'capture'
): typeof generateCaptureSpecDef;
export function useGenerateSpecDef(
    catalogType: 'materialization'
): typeof generateMaterializationSpecDef;

export function useGenerateSpecDef(catalogType: EntityWithCreateWorkflow) {
    return useMemo(() => {
        switch (catalogType) {
            case 'capture':
                return generateCaptureSpecDef;
            case 'materialization':
                return generateMaterializationSpecDef;
        }
    }, [catalogType]);
}

// Generates the captures's spec model with the given configs, on top of
// the existing spec model.
function generateCaptureSpecDef(
    existingSpec: CaptureDef | null,
    endpointConfig: ConnectorConfig,
    resourceConfigs: ResourceConfigDictionary,
    bindings: Bindings
): CaptureDef {
    // Cloned so the drafted spec passed in isn't changed
    const spec: CaptureDef = {
        bindings: [],
        // TODO: The discover executor applies starter defaults (autoDiscover,
        // expect_pub_id) only to an undrafted capture. GraphQL createDiscover
        // reads the endpoint from the draft, so we must draft the capture first,
        // which skips them. Consider having the createDiscover mutation apply
        // them to a drafted capture with no live spec, then remove this.
        ...(existingSpec ? {} : { autoDiscover: NEW_CAPTURE_AUTO_DISCOVER }),
        ...cloneDeep(existingSpec),
        endpoint: { connector: endpointConfig },
    };

    if (isEmpty(resourceConfigs) || isEmpty(bindings)) {
        spec.bindings = [];
        return spec;
    }

    Object.values(bindings).forEach((bindingUUIDs) => {
        bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
            const { data: resourceConfig, meta } = resourceConfigs[bindingUUID];

            const draftedIndex = findDraftedBindingIndex(
                spec.bindings,
                meta,
                iteratedIndex
            );
            const drafted: CaptureBinding | undefined =
                spec.bindings[draftedIndex];

            // A binding that isn't drafted is only added with a resource config
            if (!drafted && isEmpty(resourceConfig)) {
                return;
            }

            const binding: CaptureBinding = {
                ...drafted,
                resource: { ...resourceConfig },
                target: meta.collectionName,
            };
            setBindingDisable(binding, meta.disable === true);

            if (drafted) {
                spec.bindings[draftedIndex] = binding;
            } else {
                spec.bindings.push(binding);
            }
        });
    });

    spec.bindings = removeUnboundBindings(spec.bindings, bindings);

    return spec;
}

// Generates the materialization's spec model with the given configs, on top of
// the existing spec model. Each binding is matched to its drafted binding
// by itself, rather than all by index or all by name.
function generateMaterializationSpecDef(
    existingSpec: MaterializationDef | null,
    endpointConfig: ConnectorConfig | DekafConfig,
    resourceConfigs: ResourceConfigDictionary,
    bindings: Bindings,
    options: TaskSpecOptions = {}
): MaterializationDef {
    const endpoint = (
        isDekafEndpointConfig(endpointConfig)
            ? { dekaf: endpointConfig }
            : { connector: endpointConfig }
    ) as MaterializationDef['endpoint'];

    // Cloned so the drafted spec passed in isn't changed
    const spec: MaterializationDef = {
        bindings: [],
        ...cloneDeep(existingSpec),
        endpoint,
    };

    const { fullSource = null, sourceCaptureDefinition = null } = options;

    if (isEmpty(resourceConfigs) || isEmpty(bindings)) {
        spec.bindings = [];
    } else {
        Object.values(bindings).forEach((bindingUUIDs) => {
            bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                const { data: resourceConfig, meta } =
                    resourceConfigs[bindingUUID];

                const draftedIndex = findDraftedBindingIndex(
                    spec.bindings,
                    meta,
                    iteratedIndex
                );
                const drafted: MaterializationBinding | undefined =
                    spec.bindings[draftedIndex];

                // A binding that isn't drafted is only added with a resource config
                if (!drafted && isEmpty(resourceConfig)) {
                    return;
                }

                const binding: MaterializationBinding = {
                    ...drafted,
                    resource: { ...resourceConfig },
                    source: getFullSourceSetting(
                        fullSource,
                        meta.collectionName,
                        bindingUUID
                    ),
                };
                setBindingDisable(binding, meta.disable === true);

                addOrRemoveOnIncompatibleSchemaChange(
                    binding as Schema,
                    meta.onIncompatibleSchemaChange
                );

                // Remove the fields stanza from the drafted binding if it was reintroduced to the spec.
                if (drafted && meta.added) {
                    delete binding.fields;
                }

                // Set the value of the recommended flag of a new binding to that of `fieldsRecommended`.
                if (meta.liveBuiltBindingIndex === -1) {
                    setFieldsStanzaRecommended(
                        binding as Schema,
                        sourceCaptureDefinition
                    );
                }

                if (drafted) {
                    spec.bindings[draftedIndex] = binding;
                } else {
                    spec.bindings.push(binding);
                }
            });
        });

        spec.bindings = removeUnboundBindings(spec.bindings, bindings);
    }

    // Try adding at the end because these settings could be added/changed at any time
    //
    // rootTargetNaming uses spec.targetNaming at the root; source.targetNaming must never
    // coexist with it. Strip targetNaming from the source capture def to enforce this.
    const sourceCapture =
        options.targetNamingModel === 'rootTargetNaming' &&
        sourceCaptureDefinition
            ? omit(sourceCaptureDefinition, 'targetNaming')
            : sourceCaptureDefinition;

    // The spec-level settings are set by key, including the legacy
    // `sourceCapture` key, which the Flow types don't have
    const specSettings = spec as Schema;
    addOrRemoveSourceCapture(specSettings, sourceCapture);
    addOrRemoveTargetNaming(specSettings, options.targetNamingStrategy);
    addOrRemoveOnIncompatibleSchemaChange(
        specSettings,
        options.specOnIncompatibleSchemaChange
    );

    if (options.defaultFieldsRecommended) {
        const targetSourceProperty = getSourceCapturePropKey(specSettings);

        specSettings[targetSourceProperty] ??= {};
        specSettings[targetSourceProperty].fieldsRecommended = 1;
    }

    return spec;
}

// Finds the binding's index in the drafted bindings: its stored index while
// that still points at its collection, otherwise found by collection name.
function findDraftedBindingIndex<
    B extends CaptureBinding | MaterializationBinding,
>(
    draftedBindings: B[],
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

// Keeps the `disable` clause if true, otherwise totally remove it.
function setBindingDisable<B extends CaptureBinding | MaterializationBinding>(
    binding: B,
    disable: boolean
) {
    if (disable) {
        binding.disable = disable;
    } else {
        delete binding.disable;
    }
}

// Drops the drafted bindings whose collections are no longer bound.
function removeUnboundBindings<
    B extends CaptureBinding | MaterializationBinding,
>(draftedBindings: B[], bindings: Bindings): B[] {
    const boundCollections = Object.keys(bindings);

    return draftedBindings.filter((binding) =>
        boundCollections.includes(getCollectionName(binding))
    );
}
