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
    addCollections: (value: string[]) => void;
    collectionErrorsExist: boolean;
    collectionRemovalMetadata: {
        index: number;
        removedCollection: string;
        selectedCollection: string | null;
    };
    // Collection Selector
    collections: string[] | null;
    currentCollection: string | null;
    discoveredCollections: string[] | null;
    evaluateDiscoveredCollections: (
        response: CallSupabaseResponse<any>
    ) => void;

    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        rehydrating?: boolean
    ) => Promise<void>;

    // Hydration
    hydrated: boolean;

    hydrationErrorsExist: boolean;
    preFillCollections: (
        bindings: CaptureBinding[] | MaterializationBinding[],
        entityType: Entity
    ) => void;

    preFillEmptyCollections: (
        collections: LiveSpecsExtQuery[] | null[],
        rehydrating?: boolean
    ) => void;
    removeAllCollections: (
        workflow: EntityWorkflow | null,
        catalogName: string
    ) => void;

    removeCollection: (value: string) => void;
    resetConfigAndCollections: () => void;

    resetResourceConfigAndCollections: () => void;
    resetState: (keepCollections?: boolean) => void;
    // Resource Config
    resourceConfig: ResourceConfigDictionary;

    resourceConfigErrors: (string | undefined)[];
    resourceConfigErrorsExist: boolean;

    // Resource Schema
    resourceSchema: Schema;
    restrictedDiscoveredCollections: string[];

    // Server-Form Alignment
    serverUpdateRequired: boolean;
    setCurrentCollection: (collections: string | null) => void;

    setDiscoveredCollections: (value: DraftSpecQuery) => void;
    setHydrated: (value: boolean) => void;

    setHydrationErrorsExist: (value: boolean) => void;

    setResourceConfig: (
        key: string | string[],
        resourceConfig?: ResourceConfig
    ) => void;
    setResourceSchema: (val: ResourceConfigState['resourceSchema']) => void;

    setRestrictedDiscoveredCollections: (
        collection: string,
        nativeCollectionFlag?: boolean
    ) => void;

    setServerUpdateRequired: (value: boolean) => void;
    // Misc.
    stateChanged: () => boolean;
}
