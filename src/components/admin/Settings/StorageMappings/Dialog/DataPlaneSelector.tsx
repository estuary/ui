import type { DataPlaneSelectorProps } from 'src/components/admin/Settings/StorageMappings/types';

import { useMemo, useState } from 'react';

import {
    Autocomplete,
    Box,
    FormControl,
    InputLabel,
    MenuList,
    Stack,
    Typography,
} from '@mui/material';

import { isArray } from 'lodash';
import { useIntl } from 'react-intl';

import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { defaultOutline_hovered } from 'src/context/Theme';
import AutoCompleteInputWithStartAdornment from 'src/forms/renderers/AutoCompleteInputWithStartAdornment';
import Option from 'src/forms/renderers/DataPlaneSelector/Option';

const DataPlaneSelector = ({ options }: DataPlaneSelectorProps) => {
    const intl = useIntl();

    const dataPlaneName = useStorageMappingStore(
        (state) => state.dataPlaneName
    );
    const setDataPlaneName = useStorageMappingStore(
        (state) => state.setDataPlaneName
    );

    const [inputValue, setInputValue] = useState('');

    const currentOption = useMemo(
        () =>
            options.find(
                (option) => option.dataPlaneName.whole === dataPlaneName
            ),
        [dataPlaneName, options]
    );

    return (
        <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>
                {intl.formatMessage({
                    id: 'data.dataPlane',
                })}
            </InputLabel>

            <Autocomplete
                autoComplete
                clearOnBlur
                disableClearable
                fullWidth
                getOptionLabel={(option) => option.dataPlaneName.whole}
                groupBy={(option) => option.scope}
                inputValue={inputValue}
                onChange={(_event: any, value) => {
                    setDataPlaneName(value.dataPlaneName.whole);
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

                            <MenuList style={{ padding: 0 }}>
                                {children}
                            </MenuList>
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
                                        {currentOption.dataPlaneName.prefix ? (
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
                                                    currentOption.dataPlaneName
                                                        .prefix
                                                }
                                            </Box>
                                        ) : null}

                                        <DataPlaneIcon
                                            provider={
                                                currentOption.dataPlaneName
                                                    .provider
                                            }
                                            scope={currentOption.scope}
                                        />
                                    </Stack>
                                ) : null
                            }
                        />
                    );
                }}
                renderOption={(renderOptionProps, option) => {
                    return (
                        <Option
                            renderOptionProps={renderOptionProps}
                            option={{
                                label: option.dataPlaneName.whole,
                                value: option,
                            }}
                            key={option.id}
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
                    if (a.scope === b.scope) {
                        return a.dataPlaneName.whole.localeCompare(
                            b.dataPlaneName.whole
                        );
                    }

                    return a.scope === 'public' ? 1 : -1;
                })}
                value={currentOption}
            />
        </FormControl>
    );
};

export default DataPlaneSelector;
