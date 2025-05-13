type FormScope = 'binding' | 'spec';

export interface BaseFormProps {
    currentSetting: any;
    scope: FormScope;
    updateDraftedSetting: (selectedOption?: BaseAutoCompleteOption) => void;
}

export interface BaseAutoCompleteOption<T = any> {
    description: string;
    label: string;
    val: T;
}

export interface SelectorOptionProps<T> {
    option: T;
}

export interface SpecPropertyEditorFormProps<T = any> extends BaseFormProps {
    inputLabelId: string;
    invalidSettingsMessageId: string;
    options: any[];
    renderOption: (
        props: React.HTMLAttributes<HTMLLIElement> & { key: any },
        option: T
    ) => React.ReactNode;
    setErrorExists: (errorExists: boolean, scope: FormScope) => void;
}
