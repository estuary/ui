export interface BindingReviewProps {
    selected: string[];
}

export interface RelatedMaterializationSelectorProps {
    keys: any[];
    value: any;
    disabled?: boolean;
    onChange?: (
        event: any,
        newValue: string[],
        reason: string
    ) => PromiseLike<any>;
}

export interface MaterializationSelectorOptionProps {
    name: string;
    logo: string;
}
