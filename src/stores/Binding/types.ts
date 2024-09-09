import { BooleanString } from 'components/shared/buttons/types';
import { LiveSpecsExt_MaterializeOrTransform } from 'hooks/useLiveSpecsExt';
import { CallSupabaseResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { Entity, EntityWorkflow, JsonFormsData, Schema } from 'types';
import { StoreWithFieldSelection } from './slices/FieldSelection';
import { StoreWithTimeTravel } from './slices/TimeTravel';

export interface BindingMetadata {
    uuid: string;
    collection: string;
}

// Each collection is mapped to an array of UUIDs that allow us to identify the corresponding resource config.
export interface Bindings {
    [collection: string]: string[];
}

export interface ResourceConfig extends JsonFormsData {
    // errors: any[];
    meta: {
        collectionName: string;
        bindingIndex: number;
        disable?: boolean;
        previouslyDisabled?: boolean; // Used to store if the binding was disabled last time we loaded in bindings
    };
}

export interface ResourceConfigDictionary {
    [uuid: string]: ResourceConfig;
}

export interface BindingState
    extends StoreWithHydration,
        StoreWithFieldSelection,
        StoreWithTimeTravel {
    bindings: Bindings;

    // The combination of resource config store actions, `prefillResourceConfig` and `prefillBackfilledCollections`,
    // with expanded scope that initializes the time travel-related state in materialization workflows.
    // Formerly, the latter was done in `useInitializeTaskDraft`.
    prefillBindingDependentState: (
        entityType: Entity,
        liveBindings: Schema[],
        draftedBindings?: Schema[],
        rehydrating?: boolean
    ) => void;

    // The analog of resource config store action, `preFillEmptyCollections`.
    addEmptyBindings: (
        data: LiveSpecsExt_MaterializeOrTransform[] | null,
        rehydrating?: boolean
    ) => void;

    removeBinding: (binding: BindingMetadata) => void;
    removeBindings: (
        targetUUIDs: string[],
        workflow: EntityWorkflow | null,
        taskName: string
    ) => void;

    toggleDisable: (
        targetUUIDs: string | string[] | null,
        value?: boolean
    ) => Number;

    bindingErrorsExist: boolean;

    currentBinding: BindingMetadata | null;
    setCurrentBinding: (bindingUUID: string | null) => void;

    discoveredCollections: string[];
    restrictedDiscoveredCollections: string[];
    setRestrictedDiscoveredCollections: (
        collection: string,
        nativeCollectionFlag?: boolean
    ) => void;

    collectionsRequiringRediscovery: string[];
    disabledCollections: Set<string>;
    rediscoveryRequired: boolean;
    resetRediscoverySettings: () => void;

    backfilledBindings: string[];
    setBackfilledBindings: (
        increment: BooleanString,
        targetBindingUUID?: string
    ) => void;

    backfillAllBindings: boolean;

    backfillDataFlow: boolean;
    setBackfillDataFlow: (val: BindingState['backfillDataFlow']) => void;

    // Resource Schema
    resourceSchema: Schema;
    setResourceSchema: (val: BindingState['resourceSchema']) => Promise<void>;

    // Backfill Disabled
    backfillNotSupported: boolean;
    setBackfillNotSupported: (
        val: BindingState['backfillNotSupported']
    ) => void;

    // Resource Config
    resourceConfigs: ResourceConfigDictionary;

    // The partition of the second half of resource config store action, `setResourceConfig`,
    // which updated the resource config dictionary when a capture is linked to a materialization
    // and bindings are added to the specification via the collection selector.
    prefillResourceConfigs: (
        targetCollections: string[],
        disableOmit?: boolean
    ) => void;

    // The combination of resource config store actions, `updateResourceConfig` and
    // the partition of the first half of `setResourceConfig`, which updated
    // the resource config dictionary when editing a binding's resource config form.
    updateResourceConfig: (
        key: string,
        targetBindingUUID: string,
        formData: JsonFormsData,
        disableCheckingErrors?: boolean
    ) => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    // The analog of resource config store action, `evaluateDiscoveredBindings`,
    // which encapsulates the functionality of `setDiscoveredCollections`
    // and `resetConfigAndCollections`.
    evaluateDiscoveredBindings: (response: CallSupabaseResponse<any>) => void;

    // The analog of resource config store action, `resetResourceConfigAndCollections`.
    removeDiscoveredBindings: () => void;

    // Computed Values
    getCollections: () => string[];

    // Misc.
    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        connectorTagId: string,
        rehydrating?: boolean
    ) => Promise<LiveSpecsExt_MaterializeOrTransform[] | null>;

    resetState: (keepCollections?: boolean, resetActive?: boolean) => void;
}
