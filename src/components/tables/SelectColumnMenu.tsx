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
import { FormattedMessage, useIntl } from 'react-intl';

import IconMenu from 'src/components/menus/IconMenu';
import { useDisplayTableColumns } from 'src/context/TableSettings';
import { disabledButtonText_primary } from 'src/context/Theme';
import { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type { WithRequiredNonNullProperty } from 'src/types/utils';

interface Props {
    columns: WithRequiredNonNullProperty<TableColumns, 'headerIntlKey'>[];
    onChange: (
        event: React.SyntheticEvent<Element, Event>,
        checked: boolean,
        column: string
    ) => void;
    disabled?: boolean;
}

function SelectColumnMenu({ columns, onChange, disabled }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const { tableSettings } = useDisplayTableColumns();

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({
                id: 'entityTable.selectColumn.button.ariaLabel',
            })}
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
            tooltip={intl.formatMessage({
                id: 'entityTable.selectColumn.button.tooltip',
            })}
        >
            <Typography
                component={Box}
                sx={{ minWidth: 'max-content', px: 2, pb: 1, fontWeight: 500 }}
            >
                <FormattedMessage id="entityTable.selectColumn.menu.header" />
            </Typography>

            <Stack sx={{ px: 2 }}>
                {columns.map(({ headerIntlKey }, index) => (
                    <FormControl key={`column-option-${index}`} sx={{ mx: 0 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={headerIntlKey}
                                    checked={
                                        tableSettings &&
                                        Object.hasOwn(
                                            tableSettings,
                                            TablePrefixes.fieldSelection
                                        )
                                            ? tableSettings[
                                                  TablePrefixes.fieldSelection
                                              ].shownOptionalColumns.includes(
                                                  headerIntlKey
                                              )
                                            : false
                                    }
                                />
                            }
                            onChange={(event, checked) =>
                                onChange(event, checked, headerIntlKey)
                            }
                            label={intl.formatMessage({ id: headerIntlKey })}
                        />
                    </FormControl>
                ))}
            </Stack>
        </IconMenu>
    );
}

export default SelectColumnMenu;
