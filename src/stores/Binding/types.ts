import { LiveSpecsExt_MaterializeCapture } from 'hooks/useLiveSpecsExt';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { Entity, Schema } from 'types';

// Each collection is mapped to an array of UUIDs that allow us to identify the corresponding resource config.
export interface Bindings {
    [collection: string]: string[];
}

export interface BindingState extends StoreWithHydration {
    bindings: Bindings;
    prefillBindingDependentState: (
        bindings: Schema[],
        referenceBindings?: Schema[]
    ) => void;
    addEmptyBindings: (
        data: LiveSpecsExt_MaterializeCapture[] | null,
        rehydrating?: boolean
    ) => void;

    hydrateState: (
        editWorkflow: boolean,
        entityType: Entity,
        rehydrating?: boolean
    ) => Promise<LiveSpecsExt_MaterializeCapture[] | null>;

    resetState: (keepCollections?: boolean) => void;
}
