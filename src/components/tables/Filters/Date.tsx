import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Menu, MenuItem, Stack } from '@mui/material';
import { StatsFilter } from 'api/stats';
import { useZustandStore } from 'context/Zustand/provider';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { SelectableTableStore, selectableTableStoreSelectors } from '../Store';

interface Props {
    disabled: boolean;
    selectableTableStoreName: SelectTableStoreNames;
}

function DateFilter({ disabled, selectableTableStoreName }: Props) {
    const [currentOption, setCurrentOption] = useState<StatsFilter>('today');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const setStatsFilter = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setStatsFilter']
    >(selectableTableStoreName, selectableTableStoreSelectors.statsFilter.set);

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        setFilter: (option: StatsFilter) => {
            setStatsFilter(option);
            setCurrentOption(option);
            handlers.closeMenu();
        },
    };

    return (
        <Stack direction="row" spacing={2}>
            <Button
                id="stat-filter-selector-button"
                aria-controls={open ? 'stat-filter-selector-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="outlined"
                disableElevation
                onClick={handlers.openMenu}
                endIcon={<KeyboardArrowDownIcon />}
                disabled={disabled}
            >
                <FormattedMessage
                    id="entityTable.stats.filterMenu"
                    values={{
                        currentOption: (
                            <FormattedMessage
                                id={`filter.time.${currentOption}`}
                            />
                        ),
                    }}
                />
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
