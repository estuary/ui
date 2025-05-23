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
import type { EnumCellProps, EnumOption, WithClassname } from '@jsonforms/core';
import type {
    AutocompleteRenderOptionState,
    FilterOptionsState,
} from '@mui/material';
import type { ReactNode } from 'react';

import React, { useMemo } from 'react';

import { Autocomplete } from '@mui/material';

import ConnectorIcon from 'src/components/connectors/ConnectorIcon';
import AutoCompleteInputWithStartAdornment from 'src/forms/renderers/AutoCompleteInputWithStartAdornment';
import ConnectorOption from 'src/forms/renderers/ConnectorSelect/Option';

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

const areOptionsEqual = (option?: any, value?: any) => {
    return value?.id && value.id.length > 0 && option.id === value.id;
};

export const ConnectorAutoComplete = (
    props: EnumCellProps & WithClassname & WithOptionLabel
) => {
    const {
        data,
        className,
        id,
        enabled,
        path,
        options,
        handleChange,
        getOptionLabel,
        filterOptions,
    } = props;

    const [inputValue, setInputValue] = React.useState('');
    const currentOption = useMemo(
        () =>
            options?.find((option) => {
                return areOptionsEqual(option.value, data);
            }) ?? undefined,
        [data, options]
    );

    return (
        <Autocomplete
            options={options ?? []}
            getOptionLabel={getOptionLabel ?? ((option) => option.label)}
            className={className}
            id={id}
            disabled={!enabled}
            disableClearable
            value={currentOption}
            inputValue={inputValue}
            onChange={(_event: any, newValue: EnumOption | null) => {
                handleChange(path, newValue?.value ?? { id: '' });
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            autoHighlight
            autoComplete
            clearOnBlur
            fullWidth
            sx={{
                marginTop: 2,
            }}
            filterOptions={filterOptions}
            renderInput={(textFieldProps) => (
                <AutoCompleteInputWithStartAdornment
                    textFieldProps={textFieldProps}
                    startAdornment={
                        currentOption ? (
                            <ConnectorIcon
                                iconPath={currentOption.value.iconPath}
                            />
                        ) : null
                    }
                />
            )}
            renderOption={(renderOptionProps, option) => {
                return (
                    <ConnectorOption
                        renderOptionProps={renderOptionProps}
                        option={option}
                        key={option.label}
                    />
                );
            }}
        />
    );
};
