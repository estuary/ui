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
import { EnumCellProps, EnumOption, WithClassname } from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
    TextField,
} from '@mui/material';
import React, { ReactNode } from 'react';

export interface WithOptionLabel {
    getOptionLabel?(option: any): string;
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

export const CatalogNameAutoComplete = (
    props: EnumCellProps & WithClassname & WithOptionLabel
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {
        // data,
        className,
        id,
        enabled,
        // uischema,
        path,
        handleChange,
        options,
        // config,
        // getOptionLabel,
        filterOptions,
    } = props;

    // const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const [inputValue, setInputValue] = React.useState('');

    return (
        <Autocomplete
            options={options ?? []}
            // getOptionLabel={getOptionLabel ?? ((option) => option)}
            className={className}
            id={id}
            freeSolo
            disableClearable
            disabled={!enabled}
            inputValue={inputValue}
            onChange={(_event: any, newValue: string | EnumOption) => {
                handleChange(path, newValue);
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            autoHighlight
            autoSelect
            autoComplete
            clearOnBlur
            fullWidth
            sx={{
                marginTop: 2,
            }}
            filterOptions={filterOptions}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search input"
                    InputProps={{
                        ...params.InputProps,
                        type: 'search',
                    }}
                />
            )}
            renderOption={() => {
                return <>Option</>;
            }}
        />
    );
};
