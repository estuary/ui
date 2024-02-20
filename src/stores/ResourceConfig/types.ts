import { BooleanString } from 'components/editor/Bindings/Backfill';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsExt_MaterializeCapture } from 'hooks/useLiveSpecsExt';
import { CallSupabaseResponse } from 'services/supabase';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { Entity, EntityWorkflow, JsonFormsData, Schema } from 'types';

export interface ResourceConfig extends JsonFormsData {
    errors: any[];
    disable?: boolean;
    previouslyDisabled?: boolean; // Used to store if the binding was disabled last time we loaded in bindings
}

export interface ResourceConfigDictionary {
    [key: string]: ResourceConfig;
}

// TODO (naming): Determine whether the resourceConfig state property should be made plural.
//   It is a dictionary of individual resource configs, so I am leaning "yes."
export interface ResourceConfigState extends StoreWithHydration {
    // Collection Selector
    collections: string[] | null;
    preFillEmptyCollections: (
        collections: LiveSpecsExt_MaterializeCapture[] | null,
        resourceSchema: Schema,
        rehydrating?: boolean
    ) => void;
    removeCollection: (value: string) => void;
    removeCollections: (
        value: string[],
        workflow: EntityWorkflow | null,
        catalogName: string
    ) => void;
    resetConfigAndCollections: () => void;

    collectionErrorsExist: boolean;

    discoveredCollections: string[] | null;
    setDiscoveredCollections: (value: DraftSpecQuery) => void;

    restrictedDiscoveredCollections: string[];
    setRestrictedDiscoveredCollections: (
        collection: string,
        nativeCollectionFlag?: boolean
    ) => void;

    backfilledCollections: string[];
    prefillBackfilledCollections: (
        liveBindings: any[],
        draftedBindings: any[]
    ) => void;
    addBackfilledCollections: (values: string[]) => void;
    removeBackfilledCollections: (values: string[]) => void;
    setBackfilledCollections: (
        increment: BooleanString,
        targetCollection?: string
    ) => void;

    backfillAllBindings: boolean;

    // Resource Config
    resourceConfig: ResourceConfigDictionary;
    prefillResourceConfig: (bindings: any) => void;
    setResourceConfig: (
        key: string | string[],
        resourceSchema: Schema,
        currentCollection: string | null,
        resourceConfig?: ResourceConfig,
        disableCheckingErrors?: boolean,
        disableOmit?: boolean
    ) => void;
    updateResourceConfig: (
        key: string,
        resourceSchema: Schema,
        currentCollection: string | null,
        formData: JsonFormsData
    ) => void;
    toggleDisable: (key: string | string[] | null, value?: boolean) => Number;
    resetResourceConfigAndCollections: () => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        resourceSchema: Schema,
        rehydrating?: boolean
    ) => Promise<LiveSpecsExt_MaterializeCapture[] | null>;

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    collectionsRequiringRediscovery: string[];
    rediscoveryRequired: boolean;
    resetRediscoverySettings: () => void;

    evaluateDiscoveredCollections: (
        response: CallSupabaseResponse<any>
    ) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: (keepCollections?: boolean) => void;
}
