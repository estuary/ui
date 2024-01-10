import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import IconMenu from 'components/menus/IconMenu';
import { useDisplayTableColumns } from 'context/TableSettings';
import { disabledButtonText_primary } from 'context/Theme';
import { ViewColumns3 } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TableColumns } from 'types';

// TODO: Move custom utility types to a shared location.
// type WithRequiredProperty<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// type WithRequiredNonNullProperty<T, K extends keyof T> = T & {
//     [P in K]-?: Exclude<T[P], null>;
// };

interface Props {
    columns: TableColumns[];
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
                sx={{ width: 200, px: 2, pb: 1, fontWeight: 500 }}
            >
                <FormattedMessage id="entityTable.selectColumn.menu.header" />
            </Typography>

            <Stack sx={{ px: 2 }}>
                {columns.map((column, index) => {
                    const label = column.headerIntlKey
                        ? intl.formatMessage({ id: column.headerIntlKey })
                        : '';

                    return (
                        <FormControl
                            key={`column-option-${index}`}
                            sx={{ mx: 0 }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value={label}
                                        checked={
                                            tableSettings &&
                                            Object.hasOwn(
                                                tableSettings,
                                                'fieldSelection'
                                            )
                                                ? !tableSettings.fieldSelection.hiddenColumns.includes(
                                                      label
                                                  )
                                                : false
                                        }
                                        // disabled={loading || !data}
                                    />
                                }
                                onChange={(event, checked) =>
                                    onChange(event, checked, label)
                                }
                                label={label}
                            />
                        </FormControl>
                    );
                })}
            </Stack>
        </IconMenu>
    );
}

export default SelectColumnMenu;
