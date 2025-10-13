import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

type FormScope = 'binding' | 'spec';

export interface BaseFormProps {
    currentSetting: any;
    scope: FormScope;
    updateDraftedSetting: (selectedOption?: any) => Promise<any>;
}

export interface BaseAutoCompleteOption<T = any> {
    description: string | ReactNode;
    label: string;
    val: T;
}

export interface SelectorOptionProps<T> {
    option: T;
}

export interface SpecPropInputProps extends BaseFormProps {
    updateDraftedSetting: (selectedOption?: any) => Promise<any>;
    setErrorExists: (errorExists: boolean, scope: FormScope) => void;
    inputLabelId?: string;
    invalidSettingsMessageId?: string;
}

export interface SpecPropAutoCompleteProps extends SpecPropInputProps {
    options: any[];
    renderOption: (
        props: React.HTMLAttributes<HTMLLIElement> & { key: any },
        option: any
    ) => React.ReactNode;
    isOptionEqualToValue?: (option: any, optionValue: any) => boolean;
    sx?: SxProps<Theme>;
}

export interface SpecPropInvalidSettingProps {
    currentSetting: BaseFormProps['currentSetting'];
    invalidSettingsMessageId: string;
    updateDraftedSetting?: BaseFormProps['updateDraftedSetting'];
}
