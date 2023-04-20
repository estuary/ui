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
import {
    EnumCellProps,
    EnumOption,
    JsonSchema7,
    WithClassname,
} from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
    Input,
} from '@mui/material';
import { throttle } from 'lodash';
import merge from 'lodash/merge';
import React, { ReactNode } from 'react';

export interface WithOptionLabel {
    filterOptions?(
        options: any[],
        state: FilterOptionsState<any>
    ): EnumOption[];
    renderOption?(
        props: React.HTMLAttributes<HTMLLIElement>,
        option: any,
        state: AutocompleteRenderOptionState
    ): ReactNode;
}

const generateOptionsArray = (rootSchema: JsonSchema7, path: string) => {
    return (
        rootSchema.properties?.[path].examples?.map((pathVal) => {
            return {
                const: pathVal,
                label: pathVal,
            };
        }) ?? []
    );
};

const getStringValue = (val: any) => {
    return typeof val === 'string' ? val : val?.label ?? '';
};

export const CatalogNameAutoComplete = (
    props: EnumCellProps & WithClassname & WithOptionLabel
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {
        data,
        className,
        id,
        enabled,
        path,
        handleChange,
        config,
        rootSchema,
        renderOption,
        filterOptions,
    } = props;

    const options = generateOptionsArray(rootSchema as JsonSchema7, path);
    const appliedUiSchemaOptions = merge({}, config, options);
    const [inputValue, setInputValue] = React.useState(data ?? '');

    const debounceUpdate = throttle((newInputValue: any) => {
        handleChange(path, newInputValue);
    }, 250);

    return (
        <Autocomplete
            className={className}
            id={id}
            disabled={!enabled}
            value={inputValue}
            inputValue={inputValue}
            onChange={(_event: any, newValue: any) => {
                handleChange(path, newValue?.value);
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
                debounceUpdate(newInputValue);
            }}
            autoHighlight
            autoComplete
            disableClearable
            openOnFocus={inputValue.length === 0}
            fullWidth
            freeSolo
            options={options}
            getOptionLabel={getStringValue}
            style={{ marginTop: 16 }}
            renderInput={(params) => (
                <Input
                    style={{ width: '100%' }}
                    type="text"
                    inputProps={params.inputProps}
                    inputRef={params.InputProps.ref}
                    autoFocus={appliedUiSchemaOptions.focus}
                    disabled={!enabled}
                    value={inputValue}
                />
            )}
            renderOption={renderOption}
            filterOptions={filterOptions}
        />
    );
};
