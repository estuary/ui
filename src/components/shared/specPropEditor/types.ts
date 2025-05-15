type FormScope = 'binding' | 'spec';

export interface BaseFormProps {
    currentSetting: any;
    scope: FormScope;
    updateDraftedSetting: any; // TODO (source capture) typing
}

export interface BaseAutoCompleteOption<T = any> {
    description: string;
    label: string;
    val: T;
}

export interface SelectorOptionProps<T> {
    option: T;
}

export interface SpecPropInputProps extends BaseFormProps {
    updateDraftedSetting: (selectedOption?: any) => void; // TODO (source capture) typing
    inputLabelId: string;
    setErrorExists: (errorExists: boolean, scope: FormScope) => void;
    invalidSettingsMessageId?: string;
}

export interface SpecPropAutoCompleteProps extends SpecPropInputProps {
    options: any[];
    renderOption: (
        props: React.HTMLAttributes<HTMLLIElement> & { key: any },
        option: any // TODO (source capture) typing
    ) => React.ReactNode;
}
