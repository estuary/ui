import { LiveSpecsExt_MaterializeCapture } from 'hooks/useLiveSpecsExt';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { Entity, JsonFormsData, Schema } from 'types';

// Each collection is mapped to an array of UUIDs that allow us to identify the corresponding resource config.
// TODO (typing): Define UUID type.
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
        bindings: Schema[],
        referenceBindings?: Schema[]
    ) => void;
    addEmptyBindings: (
        data: LiveSpecsExt_MaterializeCapture[] | null,
        rehydrating?: boolean
    ) => void;

    currentBinding: { uuid: string; collection: string } | null;
    setCurrentBinding: (bindingUUID: string | null) => void;

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
