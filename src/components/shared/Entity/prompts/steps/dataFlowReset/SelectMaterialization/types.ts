import { LiveSpecsExt_Related } from 'api/liveSpecsExt';

export interface SelectMaterializationStepContext {
    backfillTarget: LiveSpecsExt_Related | null;
    targetHasOverlap: boolean | null;
    noMaterializations: boolean | null;
    relatedMaterializations: LiveSpecsExt_Related[] | null;
}

export interface RelatedMaterializationSelectorProps {
    keys: LiveSpecsExt_Related[];
    value: string | null;
    disabled?: boolean;
    loading?: boolean;
    onChange?: (
        event: any,
        newValue: string[],
        reason: string
    ) => PromiseLike<any>;
}

export interface MaterializationSelectorOptionProps {
    option: LiveSpecsExt_Related;
}
