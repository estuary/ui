import {
    CircularProgress,
    Divider,
    IconButton,
    ListItem,
    Menu,
    Stack,
    Typography,
} from '@mui/material';
import { StatsFilter } from 'api/stats';
import { useZustandStore } from 'context/Zustand/provider';
import { Filter } from 'iconoir-react';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import DateFilterOption from './FilterOption';

interface Props {
    header: string;
    disabled: boolean;
    selectableTableStoreName: SelectTableStoreNames;
}

function DateFilter({ disabled, header, selectableTableStoreName }: Props) {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const statsFilter = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['statsFilter']
    >(selectableTableStoreName, selectableTableStoreSelectors.statsFilter.get);

    const setStatsFilter = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setStatsFilter']
    >(selectableTableStoreName, selectableTableStoreSelectors.statsFilter.set);

    const stats = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['stats']
    >(selectableTableStoreName, selectableTableStoreSelectors.stats.get);

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        setFilter: (option: StatsFilter) => {
            setStatsFilter(option);
            handlers.closeMenu();
        },
    };

    const optionProps = {
        currentOption: statsFilter,
        onClick: handlers.setFilter,
    };

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pr: 2 }}>
            <Typography
                component="span"
                sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
            >
                <FormattedMessage
                    id="data.read"
                    values={{
                        type: <FormattedMessage id={header} />,
                    }}
                />
            </Typography>

            <IconButton
                id="stat-filter-selector-button"
                aria-controls={open ? 'stat-filter-selector-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                aria-label={intl.formatMessage(
                    { id: 'entityTable.stats.filter.label' },
                    { statsFilter }
                )}
                onClick={handlers.openMenu}
                disabled={disabled}
                color="primary"
            >
                {!disabled && stats === null ? (
                    <CircularProgress size={15} />
                ) : (
                    <Filter style={{ fontSize: 13 }} />
                )}
            </IconButton>

            <Menu
                id="stat-filter-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <ListItem>
                    <Typography sx={{ fontWeight: '500' }}>
                        <FormattedMessage id="filter.time.label" />
                    </Typography>
                </ListItem>
                <Divider />
                <DateFilterOption {...optionProps} option="today" />
                <DateFilterOption {...optionProps} option="yesterday" />
                <DateFilterOption {...optionProps} option="thisWeek" />
                <DateFilterOption {...optionProps} option="lastWeek" />
                <DateFilterOption {...optionProps} option="thisMonth" />
                <DateFilterOption {...optionProps} option="lastMonth" />
            </Menu>
        </Stack>
    );
}

export default DateFilter;
