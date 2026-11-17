import type { SelectColumnMenuProps } from 'src/components/tables/types';

import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { ViewColumns3 } from 'iconoir-react';
import { useIntl } from 'react-intl';

import IconMenu from 'src/components/menus/IconMenu';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { disabledButtonText_primary } from 'src/context/Theme';

function SelectColumnMenu({
    columns,
    disabled,
    onChange,
    tablePrefix,
}: SelectColumnMenuProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { tableSettings } = useDisplayTableColumns();

    return (
        <IconMenu
            ariaLabel="Open Table Column Customization Menu"
            disableCloseOnClick
            disabled={disabled}
            icon={
                <ViewColumns3
                    style={{
                        color: disabled
                            ? disabledButtonText_primary[theme.palette.mode]
                            : theme.palette.primary.main,
                    }}
                />
            }
            identifier="select-table-columns-menu"
            outlinedButton
            tooltip="Select Columns"
        >
            <Typography
                component={Box}
                sx={{ minWidth: 'max-content', px: 2, pb: 1, fontWeight: 500 }}
            >
                Select Columns
            </Typography>

            <Stack sx={{ px: 2 }}>
                {columns.map((headerIntlKey, index) => (
                    <FormControl key={`column-option-${index}`} sx={{ mx: 0 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={headerIntlKey}
                                    checked={
                                        tableSettings &&
                                        Object.hasOwn(
                                            tableSettings,
                                            tablePrefix
                                        )
                                            ? tableSettings[
                                                  tablePrefix
                                              ].shownOptionalColumns.includes(
                                                  headerIntlKey
                                              )
                                            : false
                                    }
                                />
                            }
                            onChange={(event, checked) => {
                                event.preventDefault();
                                event.stopPropagation();

                                onChange(checked, headerIntlKey);
                            }}
                            label={intl.formatMessage({ id: headerIntlKey })}
                        />
                    </FormControl>
                ))}
            </Stack>
        </IconMenu>
    );
}

export default SelectColumnMenu;
