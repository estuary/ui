import { BooleanString } from 'components/editor/Bindings/Backfill';
import { LiveSpecsExt_MaterializeCapture } from 'hooks/useLiveSpecsExt';
import { CallSupabaseResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { Entity, EntityWorkflow, JsonFormsData, Schema } from 'types';

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
        disable?: boolean;
        previouslyDisabled?: boolean; // Used to store if the binding was disabled last time we loaded in bindings
    };
}

export interface ResourceConfigDictionary {
    [uuid: string]: ResourceConfig;
}

export interface BindingState extends StoreWithHydration {
    bindings: Bindings;
    prefillBindingDependentState: (
        liveBindings: Schema[],
        draftedBindings?: Schema[]
    ) => void;
    addEmptyBindings: (
        data: LiveSpecsExt_MaterializeCapture[] | null,
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
    rediscoveryRequired: boolean;
    resetRediscoverySettings: () => void;

    backfilledCollections: string[];
    setBackfilledCollections: (
        increment: BooleanString,
        targetCollection?: string
    ) => void;
    addBackfilledCollections: (values: string[]) => void;
    removeBackfilledCollections: (values: string[]) => void;

    backfillAllBindings: boolean;

    // Resource Schema
    resourceSchema: Schema;
    setResourceSchema: (val: BindingState['resourceSchema']) => void;

    // Resource Config
    resourceConfigs: ResourceConfigDictionary;
    setResourceConfig: (
        targetCollections: string | string[],
        targetBindingUUID?: string,
        value?: ResourceConfig,
        disableCheckingErrors?: boolean,
        disableOmit?: boolean
    ) => void;
    updateResourceConfig: (
        key: string,
        targetBindingUUID: string,
        formData: JsonFormsData
    ) => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

    // Field Selection
    recommendFields: { [bindingUUID: string]: boolean };
    setRecommendFields: (bindingUUID: string, value: boolean) => void;

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    evaluateDiscoveredBindings: (response: CallSupabaseResponse<any>) => void;
    removeDiscoveredBindings: () => void;

    // Computed Values
    getCollections: () => string[];

    // Misc.
    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        rehydrating?: boolean
    ) => Promise<LiveSpecsExt_MaterializeCapture[] | null>;

    resetState: (keepCollections?: boolean) => void;
}
