import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsExt_MaterializeCapture } from 'hooks/useLiveSpecsExt';
import { CallSupabaseResponse } from 'services/supabase';
import { Entity, EntityWorkflow, JsonFormsData, Schema } from 'types';

export type FilterProperties = 'notBefore' | 'notAfter';

export interface FullSource {
    name?: string;
    notAfter?: string | null; // controlled by the NotDateTime
    notBefore?: string | null; // controlled by the NotDateTime
    partitions?: any; // not set in the UI today
}

export interface ResourceConfig extends JsonFormsData {
    errors: any[];
    disable?: boolean;
    fullSource?: FullSource;
    fullSourceErrors?: any[];
}

export interface ResourceConfigDictionary {
    [key: string]: ResourceConfig;
}

// TODO (naming): Determine whether the resourceConfig state property should be made plural.
//   It is a dictionary of individual resource configs, so I am leaning "yes."
export interface ResourceConfigState {
    // Collection Selector
    collections: string[] | null;
    preFillEmptyCollections: (
        collections: LiveSpecsExt_MaterializeCapture | null[],
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

    currentCollection: string | null;
    setCurrentCollection: (collections: string | null) => void;

    discoveredCollections: string[] | null;
    setDiscoveredCollections: (value: DraftSpecQuery) => void;

    restrictedDiscoveredCollections: string[];
    setRestrictedDiscoveredCollections: (
        collection: string,
        nativeCollectionFlag?: boolean
    ) => void;

    // Resource Config
    resourceConfig: ResourceConfigDictionary;
    prefillResourceConfig: (bindings: any) => void;
    setResourceConfig: (
        key: string | string[],
        resourceConfig?: ResourceConfig,
        disableCheckingErrors?: boolean,
        disableOmit?: boolean
    ) => void;
    updateResourceConfig: (key: string, formData: JsonFormsData) => void;
    toggleDisable: (key: string | string[] | null, value?: boolean) => Number;
    resetResourceConfigAndCollections: () => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

    updateFullSourceProperty: (
        collection: string,
        key: string,
        value: FilterProperties | null
    ) => void;
    updateFullSourceErrors: (collection: string, errors?: any[]) => void;

    // Resource Schema
    resourceSchema: Schema;
    setResourceSchema: (val: ResourceConfigState['resourceSchema']) => void;

    // Hydration
    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;

    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        rehydrating?: boolean
    ) => Promise<void>;

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setServerUpdateRequired: (value: boolean) => void;

    rediscoveryRequired: boolean;
    setRediscoveryRequired: (value: boolean) => void;

    evaluateDiscoveredCollections: (
        response: CallSupabaseResponse<any>
    ) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: (keepCollections?: boolean) => void;
}
