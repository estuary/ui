import React from 'react';

import { autocompleteClasses, AutocompleteProps, Popper } from '@mui/material';
import { styled } from '@mui/material/styles';

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

export const autoCompleteDefaults_Virtual_Multiple: AutocompleteProps<
    any,
    true,
    false,
    false,
    'div'
> = {
    ListboxComponent,
    PopperComponent,
    blurOnSelect: false,
    disableCloseOnSelect: true,
    multiple: true,
    options: [], // You MUST provide these yourself
    size: 'small',
    renderInput: () => null, // You MUST provide these yourself
    renderGroup: (params) => params as unknown as React.ReactNode,
    renderOption: (props, option, state) => {
        return [props, option, state.selected] as React.ReactNode;
    },
};
