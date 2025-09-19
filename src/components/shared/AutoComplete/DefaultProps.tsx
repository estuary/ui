import type { AutocompleteProps } from '@mui/material';
import type React from 'react';

import { autocompleteClasses, Popper } from '@mui/material';
import { styled } from '@mui/material/styles';

import ListboxComponent from 'src/components/shared/AutoComplete/VirtualizedList';

export type BaseAutocompleteProps<T = any> = AutocompleteProps<
    T,
    false,
    false,
    boolean | undefined,
    'div'
>;

const PopperComponent = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        'boxSizing': 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
}) as any;

const autoCompleteDefaults: BaseAutocompleteProps = {
    // MUST provide
    options: [],
    renderInput: () => null,

    // Can alter if you want
    PopperComponent,
    size: 'small',
};

export const autoCompleteDefaults_Virtual: AutocompleteProps<
    any,
    any,
    false,
    boolean | undefined,
    'div'
> = {
    ...autoCompleteDefaults,
    ListboxComponent,
    disableCloseOnSelect: true,
    renderGroup: (params) => params as unknown as React.ReactNode,
    renderOption: (props, option, state) => {
        return [props, option, state.selected] as React.ReactNode;
    },
};

export const autoCompleteDefaults_Virtual_Non_Clearable: AutocompleteProps<
    any,
    false,
    true,
    false,
    'div'
> = {
    disableCloseOnSelect: false,
    disableClearable: true,
    multiple: false,
    options: [], // You MUST provide these yourself
    size: 'small',
    renderInput: () => null, // You MUST provide these yourself

    // TODO (virtualize autocomplete)
    // need a way to pass in the option rendering when using this
    // ListboxComponent,
    // PopperComponent,
    // renderOption: (props, option, state) => {
    //     return [props, option, state.selected] as React.ReactNode;
    // },
};

export const autoCompleteDefaults_Virtual_Multiple: AutocompleteProps<
    any,
    true,
    false,
    boolean | undefined,
    'div'
> = {
    ...autoCompleteDefaults_Virtual,
    multiple: true,
    blurOnSelect: false,
};

export const getTypedAutoCompleteDefaults = <
    T = any,
>(): BaseAutocompleteProps<T> => autoCompleteDefaults;
