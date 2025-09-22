import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import type { BaseAutocompleteProps } from 'src/components/shared/AutoComplete/DefaultProps';

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
    inputLabelId: string;
    setErrorExists: (errorExists: boolean, scope: FormScope) => void;
    invalidSettingsMessageId?: string;
}

export interface SpecPropAutoCompleteProps extends SpecPropInputProps {
    options: any[];
    renderOption: (
        props: React.HTMLAttributes<HTMLLIElement> & { key: any },
        option: any
    ) => React.ReactNode;
    filterOptions?: BaseAutocompleteProps['filterOptions'];
    freeSolo?: boolean;
    handleChange?: BaseAutocompleteProps['onChange'];
    isOptionEqualToValue?: (option: any, optionValue: any) => boolean;
    isSelectionInvalid?: (
        value?: boolean | number | string | undefined
    ) => boolean;
    sx?: SxProps<Theme>;
}

export interface SpecPropInvalidSettingProps {
    currentSetting: BaseFormProps['currentSetting'];
    invalidSettingsMessageId: string;
    updateDraftedSetting?: BaseFormProps['updateDraftedSetting'];
}
