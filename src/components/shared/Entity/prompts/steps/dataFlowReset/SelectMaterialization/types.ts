import { LiveSpecsExt_Related } from 'hooks/useLiveSpecsExt';

export interface BindingReviewProps {
    selected: string[];
}

export type MaterializationsProps = BindingReviewProps;

export interface RelatedMaterializationSelectorProps {
    keys: LiveSpecsExt_Related[];
    value: string | null;
    disabled?: boolean;
    onChange?: (
        event: any,
        newValue: string[],
        reason: string
    ) => PromiseLike<any>;
}

export interface MaterializationSelectorOptionProps {
    option: LiveSpecsExt_Related;
}
