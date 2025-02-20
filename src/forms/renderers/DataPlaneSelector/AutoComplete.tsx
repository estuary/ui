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
import { EnumCellProps, EnumOption, WithClassname } from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
    MenuList,
    Typography,
} from '@mui/material';
import DataPlaneIcon from 'components/shared/Entity/DataPlaneIcon';
import React, { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import AutoCompleteInputWithStartAdornment from '../AutoCompleteInputWithStartAdornment';
import Option from './Option';

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
    return typeof value?.id === 'string' && option.id === value.id;
};

export const DataPlaneAutoComplete = ({
    data,
    className,
    id,
    enabled,
    path,
    options,
    handleChange,
    getOptionLabel,
    filterOptions,
}: EnumCellProps & WithClassname & WithOptionLabel) => {
    const intl = useIntl();

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
            autoComplete
            className={className}
            clearOnBlur
            disabled={!enabled}
            disableClearable
            filterOptions={filterOptions}
            fullWidth
            getOptionLabel={getOptionLabel ?? ((option) => option.label)}
            groupBy={(option) => option.value.scope}
            id={id}
            inputValue={inputValue}
            onChange={(_event: any, newValue: EnumOption | null) => {
                handleChange(path, newValue?.value ?? { id: '' });
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderGroup={({ group, children }) => (
                <li key={group}>
                    <Typography
                        color="primary"
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                            fontWeight: 500,
                            pl: 1,
                            py: 1,
                            textTransform: 'capitalize',
                        }}
                    >
                        {intl.formatMessage({ id: `common.${group}` })}
                    </Typography>

                    <MenuList style={{ padding: 0 }}>{children}</MenuList>
                </li>
            )}
            renderInput={(textFieldProps) => (
                <AutoCompleteInputWithStartAdornment
                    textFieldProps={textFieldProps}
                    startAdornment={
                        currentOption ? (
                            <DataPlaneIcon
                                provider={
                                    currentOption.value.dataPlaneName.provider
                                }
                                scope={currentOption.value.scope}
                            />
                        ) : null
                    }
                />
            )}
            renderOption={(renderOptionProps, option) => {
                return (
                    <Option
                        renderOptionProps={renderOptionProps}
                        option={option}
                        key={option.label}
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
            options={options ?? []}
            value={currentOption}
        />
    );
};
