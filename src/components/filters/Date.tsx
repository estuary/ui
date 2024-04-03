import {
    Button,
    CircularProgress,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import { StatsFilter } from 'api/stats';
import { linkButtonSx } from 'context/Theme';
import { useZustandStore } from 'context/Zustand/provider';
import { Filter } from 'iconoir-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

interface Props {
    header: string;
    disabled: boolean;
    selectableTableStoreName: SelectTableStoreNames;
}

function DateFilter({ disabled, header, selectableTableStoreName }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const statsFilter = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['statsFilter']
    >(selectableTableStoreName, selectableTableStoreSelectors.statsFilter.get);
    console.log('statsFilter', statsFilter);

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

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography
                component="span"
                sx={{ mt: 0.5, fontWeight: 500, whiteSpace: 'nowrap' }}
            >
                <FormattedMessage id={header} />
            </Typography>

            <Button
                id="stat-filter-selector-button"
                aria-controls={open ? 'stat-filter-selector-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="text"
                disableElevation
                onClick={handlers.openMenu}
                endIcon={
                    !disabled && stats === null ? (
                        <CircularProgress size={15} />
                    ) : (
                        <Filter style={{ fontSize: 13 }} />
                    )
                }
                disabled={disabled}
                sx={{ ...linkButtonSx }}
            >
                <FormattedMessage id={`filter.time.${statsFilter}`} />
            </Button>

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
                <MenuItem onClick={() => handlers.setFilter('today')}>
                    <FormattedMessage id="filter.time.today" />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter('yesterday')}>
                    <FormattedMessage id="filter.time.yesterday" />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter('thisWeek')}>
                    <FormattedMessage id="filter.time.thisWeek" />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter('lastWeek')}>
                    <FormattedMessage id="filter.time.lastWeek" />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter('thisMonth')}>
                    <FormattedMessage id="filter.time.thisMonth" />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter('lastMonth')}>
                    <FormattedMessage id="filter.time.lastMonth" />
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default DateFilter;
