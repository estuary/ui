import { autocompleteClasses, AutocompleteProps, Popper } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const PopperComponent = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        'boxSizing': 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
}) as any;

const autoCompleteDefaults: AutocompleteProps<any, any, false, false, 'div'> = {
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
    false,
    'div'
> = {
    ...autoCompleteDefaults,
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
    ListboxComponent,
    PopperComponent,
    disableCloseOnSelect: false,
    disableClearable: true,
    multiple: false,
    options: [], // You MUST provide these yourself
    size: 'small',
    renderInput: () => null, // You MUST provide these yourself
    renderGroup: (params) => params as unknown as React.ReactNode,
    renderOption: (props, option, state) => {
        return [props, option, state.selected] as React.ReactNode;
    },
};

export const autoCompleteDefaults_Virtual_Multiple: AutocompleteProps<
    any,
    true,
    false,
    false,
    'div'
> = {
    ...autoCompleteDefaults_Virtual,
    multiple: true,
    blurOnSelect: false,
};

export const getTypedAutoCompleteDefaults = <T = any,>(): AutocompleteProps<
    T,
    false,
    false,
    false,
    'div'
> => autoCompleteDefaults;
