// We  heavily base this off JsonForms stuff so tweaking linting options they don't use
/* eslint-disable @typescript-eslint/unbound-method */

/*
  The MIT License

  Copyright (c) 2017-2020 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import { ControlProps, EnumOption, WithClassname } from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
    Input,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { ISO_8601_DURATION_RE } from 'validation';

export interface WithOptionLabel {
    getOptionLabel?(option: EnumOption): string;
    renderOption?(
        props: React.HTMLAttributes<HTMLLIElement>,
        option: EnumOption,
        state: AutocompleteRenderOptionState
    ): ReactNode;
    filterOptions?(
        options: EnumOption[],
        state: FilterOptionsState<EnumOption>
    ): EnumOption[];
}

const DURATION_OPTIONS = [
    '0s',
    '30s',
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '12h',
];

export const DurationAutoComplete = (props: ControlProps & WithClassname) => {
    const { data, className, id, enabled, path, handleChange } = props;

    const [inputValue, setInputValue] = React.useState(data);

    console.log('props', props);
    console.log('data', data);
    console.log('inputValue', inputValue);

    return (
        <Autocomplete
            autoComplete
            className={className}
            disabled={!enabled}
            freeSolo
            fullWidth
            id={id}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => {
                console.log('newInputValue', newInputValue);

                const newInputValueUpper = newInputValue
                    ? newInputValue.toUpperCase()
                    : '';

                // Do ahead and make sure the input is updated and show to the user
                //  that was are upper casing the input
                setInputValue(newInputValueUpper);

                handleChange(
                    path,
                    // See if we need to format the string and if so just assume they are entering TIME
                    ISO_8601_DURATION_RE.test(newInputValueUpper)
                        ? newInputValueUpper
                        : `PT${newInputValueUpper}`
                );
            }}
            renderInput={(textFieldProps) => {
                console.log('textFieldProps', textFieldProps);

                return (
                    <Input
                        {...textFieldProps.InputProps}
                        inputProps={textFieldProps.inputProps}
                        fullWidth={textFieldProps.fullWidth}
                        disabled={textFieldProps.disabled}
                    />
                );
            }}
            slotProps={{
                popper: {
                    sx: {
                        '& .MuiAutocomplete-listbox': {
                            p: 0,
                        },
                    },
                },
            }}
            sx={{
                mt: 2,
            }}
            options={DURATION_OPTIONS}
            // value={currentOption}
        />
    );
};
