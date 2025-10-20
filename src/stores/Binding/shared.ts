import type { PostgrestError } from '@supabase/postgrest-js';
import type { LiveSpecsExtQuery } from 'src/hooks/useLiveSpecsExt';
import type {
    BindingFieldSelectionDictionary,
    HydrationStatus,
} from 'src/stores/Binding/slices/FieldSelection';
import type {
    BindingChanges,
    Bindings,
    BindingState,
    ResourceConfig,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type { Entity, Schema } from 'src/types';
import type { StoreApi } from 'zustand';

import { difference, intersection } from 'lodash';

import { getDraftSpecsByDraftId } from 'src/api/draftSpecs';
import { getSchema_Resource } from 'src/api/hydration';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { BASE_ERROR } from 'src/services/supabase';
import { getInitialBackfillData } from 'src/stores/Binding/slices/Backfill';
import {
    getInitialFieldSelectionData,
    isHydrating,
} from 'src/stores/Binding/slices/FieldSelection';
import { getInitialTimeTravelData } from 'src/stores/Binding/slices/TimeTravel';
import { getInitialHydrationData } from 'src/stores/extensions/Hydration';
import { populateErrors } from 'src/stores/utils';
import { hasLength, hasOwnProperty } from 'src/utils/misc-utils';
import { formatCaptureInterval } from 'src/utils/time-utils';
import { getCollectionName, getDisableProps } from 'src/utils/workflow-utils';

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

const resetSingleCollectionMetadata = (
    state: BindingState,
    collection: string
) => {
    state.collectionMetadata[collection].added = false;
    state.collectionMetadata[collection].sourceBackfillRecommended = false;
};

export const resetCollectionMetadata = (
    state: BindingState,
    targetCollections?: string[]
) => {
    if (targetCollections) {
        targetCollections.forEach((collection) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (state.collectionMetadata?.[collection]) {
                resetSingleCollectionMetadata(state, collection);
            }
        });

        return;
    }

    Object.keys(state.collectionMetadata).forEach((collection) => {
        resetSingleCollectionMetadata(state, collection);
    });
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
    resourceConfigs: ResourceConfigDictionary,
    maintainPreviousCurrentBinding?: boolean
) => {
    const allResourceConfigs = Object.entries(resourceConfigs);
    const initialConfig = allResourceConfigs.at(0);

    if (!initialConfig) {
        return;
    }

    // We will just match based on name and that is not perfect but good enough
    //  since very few use cases of duplication bindings exist.
    let preferredConfig;
    if (maintainPreviousCurrentBinding && state.currentBinding) {
        preferredConfig = allResourceConfigs.find(
            ([_uuid, datum]) =>
                datum.meta.collectionName === state.currentBinding?.collection
        );
    }

    const [bindingUUID, resourceConfig] = preferredConfig ?? initialConfig;
    state.currentBinding = {
        uuid: bindingUUID,
        collection: resourceConfig.meta.collectionName,
    };
};

const getResourceConfig = (
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
            bindingIndex,
            builtBindingIndex: -1,
            collectionName,
            liveBindingIndex: -1,
            liveBuiltBindingIndex: -1,
            onIncompatibleSchemaChange: binding?.onIncompatibleSchemaChange,
            validatedBindingIndex: -1,
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

export const updateBackfilledBindingState = (
    state: BindingState,
    mappedUUIDsAndResourceConfigs: [string, ResourceConfig][]
) => {
    if (state.backfilledBindings.length > 0) {
        const evaluatedBackfilledBindings = mappedUUIDsAndResourceConfigs
            .map(([bindingUUID, _resourceConfig]) => bindingUUID)
            .filter((bindingUUID) =>
                state.backfilledBindings.includes(bindingUUID)
            );

        state.backfilledBindings = evaluatedBackfilledBindings;

        state.backfillAllBindings =
            state.backfilledBindings.length ===
            Object.keys(state.resourceConfigs).length;
    }
};

export const stubBindingFieldSelection = (
    existingSelections: BindingFieldSelectionDictionary,
    bindingUUIDs: string[],
    defaultStatus?: HydrationStatus,
    resourceConfigs?: ResourceConfigDictionary,
    liveBindings?: Schema[]
): BindingFieldSelectionDictionary => {
    const selections: BindingFieldSelectionDictionary = {};

    bindingUUIDs.forEach((bindingUUID) => {
        if (!existingSelections?.[bindingUUID]) {
            let liveGroupByKey: string[] = [];

            if (resourceConfigs && liveBindings && liveBindings.length > 0) {
                const liveBindingIndex = hasOwnProperty(
                    resourceConfigs,
                    bindingUUID
                )
                    ? resourceConfigs[bindingUUID].meta.liveBindingIndex
                    : -1;

                liveGroupByKey =
                    liveBindingIndex > -1
                        ? (liveBindings[liveBindingIndex]?.fields?.groupBy ??
                          [])
                        : [];
            }

            selections[bindingUUID] = {
                groupBy: {
                    liveGroupByKey,
                    value: { explicit: [], implicit: [] },
                },
                hasConflicts: false,
                hydrating: defaultStatus ? isHydrating(defaultStatus) : false,
                status: defaultStatus ?? 'HYDRATED',
                validationFailed: false,
                value: {},
            };

            return;
        }

        selections[bindingUUID] = existingSelections[bindingUUID];
    });

    return selections;
};

export const STORE_KEY = 'Bindings';

export const hydrateConnectorTagDependentState = async (
    connectorTagId: string,
    get: StoreApi<BindingState>['getState']
): Promise<Schema | null> => {
    if (!hasLength(connectorTagId)) {
        return null;
    }

    const { data, error } = await getSchema_Resource(connectorTagId);

    if (error) {
        get().setHydrationErrorsExist(true);
    } else if (data?.resource_spec_schema) {
        const schema = data.resource_spec_schema as unknown as Schema;
        await get().setResourceSchema(schema);

        get().setBackfillSupported(!Boolean(data.disable_backfill));
    }

    return data;
};

export const hydrateSpecificationDependentState = async (
    defaultInterval: string | null | undefined,
    entityType: Entity,
    fallbackInterval: string | null,
    get: StoreApi<BindingState>['getState'],
    liveSpec: LiveSpecsExtQuery['spec'],
    searchParams: URLSearchParams
): Promise<{
    bindingChanges: BindingChanges;
    error: PostgrestError | null;
}> => {
    const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);

    let bindingChanges: BindingChanges = { addedCollections: [] };

    if (draftId) {
        const { data: draftSpecs, error } = await getDraftSpecsByDraftId(
            draftId,
            entityType
        );

        if (error || !draftSpecs || draftSpecs.length === 0) {
            return {
                bindingChanges,
                error: error ?? {
                    ...BASE_ERROR,
                    message: `An issue was encountered fetching the drafted specification for this ${entityType}`,
                },
            };
        }

        bindingChanges = get().prefillBindingDependentState(
            entityType,
            liveSpec.bindings,
            draftSpecs[0].spec.bindings,
            undefined,
            true
        );

        const targetInterval = draftSpecs[0].spec?.interval;

        get().setCaptureInterval(
            targetInterval
                ? formatCaptureInterval(targetInterval)
                : fallbackInterval,
            defaultInterval
        );

        get().setSpecOnIncompatibleSchemaChange(
            draftSpecs[0].spec?.onIncompatibleSchemaChange
        );
    } else {
        bindingChanges = get().prefillBindingDependentState(
            entityType,
            liveSpec.bindings,
            undefined,
            undefined,
            true
        );

        get().setCaptureInterval(
            liveSpec?.interval ?? fallbackInterval,
            defaultInterval
        );

        get().setSpecOnIncompatibleSchemaChange(
            liveSpec?.onIncompatibleSchemaChange
        );
    }

    return { bindingChanges, error: null };
};

export const getInitialBindingData = (): Pick<
    BindingState,
    'bindingErrorsExist' | 'bindings' | 'currentBinding'
> => ({
    bindingErrorsExist: false,
    bindings: {},
    currentBinding: null,
});

export const getInitialMiscData = (): Pick<
    BindingState,
    | 'captureInterval'
    | 'collectionMetadata'
    | 'collectionsRequiringRediscovery'
    | 'defaultCaptureInterval'
    | 'discoveredCollections'
    | 'onIncompatibleSchemaChange'
    | 'onIncompatibleSchemaChangeErrorExists'
    | 'rediscoveryRequired'
    | 'resourceConfigErrorsExist'
    | 'resourceConfigErrors'
    | 'resourceConfigs'
    | 'resourceSchema'
    | 'restrictedDiscoveredCollections'
    | 'serverUpdateRequired'
    | 'resourceConfigPointers'
> => ({
    captureInterval: null,
    collectionMetadata: {},
    collectionsRequiringRediscovery: [],
    defaultCaptureInterval: null,
    discoveredCollections: [],
    onIncompatibleSchemaChange: undefined,
    onIncompatibleSchemaChangeErrorExists: {
        binding: false,
        spec: false,
    },
    rediscoveryRequired: false,
    resourceConfigErrorsExist: false,
    resourceConfigErrors: [],
    resourceConfigs: {},
    resourceSchema: {},
    restrictedDiscoveredCollections: [],
    serverUpdateRequired: false,
    resourceConfigPointers: undefined,
});

export const getInitialStoreData = () => ({
    ...getInitialHydrationData(),
    ...getInitialBindingData(),
    ...getInitialFieldSelectionData(),
    ...getInitialMiscData(),
    ...getInitialTimeTravelData(),
    ...getInitialBackfillData(),
});

export const getInitialStoreDataAndKeepBindings = () => ({
    ...getInitialFieldSelectionData(),
    ...getInitialMiscData(),
    ...getInitialTimeTravelData(),
    ...getInitialBackfillData(),
});
