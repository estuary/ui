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
    Box,
    FilterOptionsState,
    Input,
} from '@mui/material';
import ConnectorName from 'components/ConnectorName';
import merge from 'lodash/merge';
import React, { ReactNode } from 'react';

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

export const ConnectorAutoComplete = (
    props: EnumCellProps & WithClassname & WithOptionLabel
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {
        data,
        className,
        id,
        enabled,
        errors,
        uischema,
        path,
        handleChange,
        options,
        config,
        getOptionLabel,
        filterOptions,
    } = props;

    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const [inputValue, setInputValue] = React.useState(data ?? '');

    const findOption = options?.find((o) => o.value === data) ?? null;
    return (
        <Autocomplete
            className={className}
            id={id}
            disabled={!enabled}
            value={findOption}
            onChange={(_event: any, newValue: EnumOption | null) => {
                handleChange(path, newValue?.value);
            }}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            autoHighlight
            autoSelect
            autoComplete
            fullWidth
            options={options ?? []}
            getOptionLabel={getOptionLabel ?? ((option) => option.label)}
            sx={{
                marginTop: 2,
                borderColor: errors.length > 0 ? 'red' : null,
            }}
            renderInput={({ inputProps, InputProps }: any) => {
                return (
                    <Box
                        sx={{
                            '.MuiBox-root + .MuiInput-root > input': {
                                textIndent: '20px',
                            },
                        }}
                    >
                        {inputProps.value !== '' ? (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 22,
                                }}
                            >
                                <ConnectorName
                                    path="https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg"
                                    connector=""
                                />
                            </Box>
                        ) : null}

                        <Input
                            style={{ width: '100%' }}
                            type="text"
                            inputProps={inputProps}
                            inputRef={InputProps.ref}
                            autoFocus={appliedUiSchemaOptions.focus}
                            disabled={!enabled}
                        />
                    </Box>
                );
            }}
            renderOption={(renderOptionProps: any, option) => {
                return (
                    <Box component="li" {...renderOptionProps}>
                        <ConnectorName
                            path="https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg"
                            connector={option.label}
                        />
                    </Box>
                );
            }}
            filterOptions={filterOptions}
        />
    );
};
