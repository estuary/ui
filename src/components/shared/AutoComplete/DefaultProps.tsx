import { autocompleteClasses, AutocompleteProps, Popper } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import ListboxComponent from './VirtualizedList';

const PopperComponent = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        'boxSizing': 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
}) as any;

export const autoCompleteDefaults_Virtual: AutocompleteProps<
    any,
    any,
    false,
    false,
    'div'
> = {
    ListboxComponent,
    PopperComponent,
    blurOnSelect: false,
    disableCloseOnSelect: true,
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
};
