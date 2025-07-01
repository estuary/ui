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

import { Autocomplete, Box, MenuList, Stack, Typography } from '@mui/material';

import { isArray } from 'lodash';
import { useIntl } from 'react-intl';

import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { useDataPlaneOptions } from 'src/components/shared/Entity/DetailsForm/useDataPlaneOptions';
import { defaultOutline_hovered } from 'src/context/Theme';
import AutoCompleteInputWithStartAdornment from 'src/forms/renderers/AutoCompleteInputWithStartAdornment';
import Option from 'src/forms/renderers/DataPlaneSelector/Option';
import { DATA_PLANE_OPTION_TEMPLATE } from 'src/utils/dataPlane-utils';

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
    return (
        (typeof value?.id === 'string' && option.id === value.id) ||
        (value === undefined &&
            option.dataPlaneName.whole ===
                DATA_PLANE_OPTION_TEMPLATE.dataPlaneName.whole)
    );
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
    const scopedOptions = useDataPlaneOptions();

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
            renderGroup={({ group, children }) =>
                children === null ||
                (isArray(children) &&
                    children.some((node) => node !== null)) ? (
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
                ) : null
            }
            renderInput={(textFieldProps) => {
                return (
                    <AutoCompleteInputWithStartAdornment
                        textFieldProps={textFieldProps}
                        startAdornment={
                            currentOption ? (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        alignItems: 'center',
                                    }}
                                >
                                    {currentOption.value.dataPlaneName
                                        .prefix ? (
                                        <Box
                                            sx={{
                                                borderRight: (theme) =>
                                                    defaultOutline_hovered[
                                                        theme.palette.mode
                                                    ],
                                                fontsize: 9,
                                                pr: 1,
                                            }}
                                        >
                                            {
                                                currentOption.value
                                                    .dataPlaneName.prefix
                                            }
                                        </Box>
                                    ) : null}

                                    <DataPlaneIcon
                                        provider={
                                            currentOption.value.dataPlaneName
                                                .provider
                                        }
                                        scope={currentOption.value.scope}
                                    />
                                </Stack>
                            ) : null
                        }
                    />
                );
            }}
            renderOption={(renderOptionProps, option) => {
                if (!scopedOptions.includes(option.value)) {
                    return null;
                }

                return (
                    <Option
                        renderOptionProps={renderOptionProps}
                        option={option}
                        key={option.value.id}
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
            options={(options ?? []).sort((a, b) => {
                if (a.value.scope === b.value.scope) {
                    return a.value.dataPlaneName.whole.localeCompare(
                        b.value.dataPlaneName.whole
                    );
                }

                return a.value.scope === 'public' ? 1 : -1;
            })}
            value={currentOption}
        />
    );
};
