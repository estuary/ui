import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import IconMenu from 'components/menus/IconMenu';
import { useDisplayTableColumns } from 'context/TableSettings';
import { ViewColumns3 } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TableColumns } from 'types';

// type WithRequiredProperty<T, K extends keyof T> = T & { [P in K]-?: T[P] };

interface Props {
    columns: TableColumns[];
    onChange: (
        event: React.SyntheticEvent<Element, Event>,
        checked: boolean
    ) => void;
}

function SelectColumnMenu({ columns, onChange }: Props) {
    const intl = useIntl();

    const { tableSettings } = useDisplayTableColumns();

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({
                id: 'entityTable.selectColumn.button.ariaLabel',
            })}
            icon={<ViewColumns3 />}
            identifier="select-table-columns-menu"
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
                                                ? tableSettings.fieldSelection.hiddenColumns.includes(
                                                      label
                                                  )
                                                : false
                                        }
                                        // disabled={loading || !data}
                                    />
                                }
                                onChange={onChange}
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
