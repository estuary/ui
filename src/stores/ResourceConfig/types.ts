import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import { CallSupabaseResponse } from 'services/supabase';
import { Entity, EntityWorkflow, JsonFormsData, Schema } from 'types';
import {
    CaptureBinding,
    MaterializationBinding,
} from '../../../flow_deps/flow';

export interface ResourceConfig {
    [key: string]: JsonFormsData | any[];
    errors: any[];
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
        collections: LiveSpecsExtQuery[] | null[],
        rehydrating?: boolean
    ) => void;
    preFillCollections: (
        bindings: CaptureBinding[] | MaterializationBinding[],
        entityType: Entity
    ) => void;
    addCollections: (value: string[]) => void;
    removeCollection: (value: string) => void;
    removeAllCollections: (
        workflow: EntityWorkflow | null,
        catalogName: string
    ) => void;
    resetConfigAndCollections: () => void;

    collectionRemovalMetadata: {
        selectedCollection: string | null;
        removedCollection: string;
        index: number;
    };

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
    setResourceConfig: (
        key: string | string[],
        resourceConfig?: ResourceConfig
    ) => void;
    resetResourceConfigAndCollections: () => void;

    resourceConfigErrorsExist: boolean;
    resourceConfigErrors: (string | undefined)[];

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

    evaluateDiscoveredCollections: (
        response: CallSupabaseResponse<any>
    ) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: (keepCollections?: boolean) => void;
}
