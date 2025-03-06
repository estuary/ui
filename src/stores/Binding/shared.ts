import { PostgrestError } from '@supabase/postgrest-js';
import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import { getSchema_Resource } from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import { difference, intersection } from 'lodash';
import { BASE_ERROR } from 'services/supabase';
import { getInitialHydrationData } from 'stores/extensions/Hydration';
import { populateErrors } from 'stores/utils';
import { Entity, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { formatCaptureInterval } from 'utils/time-utils';
import { getCollectionName, getDisableProps } from 'utils/workflow-utils';
import { StoreApi } from 'zustand';
import { getInitialFieldSelectionData } from './slices/FieldSelection';
import { getInitialTimeTravelData } from './slices/TimeTravel';
import {
    BindingChanges,
    Bindings,
    BindingState,
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

const resetPartialCollectionMetadata = (
    state: BindingState,
    collection: string
) => {
    state.collectionMetadata[collection].added = false;
    state.collectionMetadata[collection].sourceBackfillRecommended = false;
};

export const overridePartialCollectionMetadata = (
    state: BindingState,
    targetCollections?: string[]
) => {
    if (targetCollections) {
        targetCollections.forEach((collection) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (state.collectionMetadata?.[collection]) {
                resetPartialCollectionMetadata(state, collection);
            }
        });

        return;
    }

    Object.keys(state.collectionMetadata).forEach((collection) => {
        resetPartialCollectionMetadata(state, collection);
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
            draftSpecs[0].spec.bindings
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
            liveSpec.bindings
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
    | 'backfilledBindings'
    | 'backfillAllBindings'
    | 'backfillDataFlow'
    | 'backfillDataFlowTarget'
    | 'backfillSupported'
    | 'captureInterval'
    | 'collectionMetadata'
    | 'collectionsRequiringRediscovery'
    | 'defaultCaptureInterval'
    | 'discoveredCollections'
    | 'evolvedCollections'
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
    backfillAllBindings: false,
    backfillDataFlowTarget: null,
    backfillDataFlow: false,
    backfillSupported: true,
    backfilledBindings: [],
    captureInterval: null,
    collectionMetadata: {},
    collectionsRequiringRediscovery: [],
    defaultCaptureInterval: null,
    discoveredCollections: [],
    evolvedCollections: [],
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
    ...getInitialBindingData(),
    ...getInitialFieldSelectionData(),
    ...getInitialHydrationData(),
    ...getInitialMiscData(),
    ...getInitialTimeTravelData(),
});
