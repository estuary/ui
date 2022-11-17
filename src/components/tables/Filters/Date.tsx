import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Button, Menu, MenuItem, Stack } from '@mui/material';
import subDays from 'date-fns/subDays';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

type FilterOptions =
    | `today`
    | `yesterday`
    | `lastWeek`
    | `thisWeek`
    | `lastMonth`
    | `thisMonth`;

function DateFilter() {
    const [currentOption, setCurrentOption] = useState<FilterOptions>('today');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        setFilter: (option: FilterOptions) => {
            let foo;
            switch (option) {
                case 'yesterday':
                    foo = subDays(new Date(), 1);
                    break;
                default: {
                    foo = new Date();
                    break;
                }
            }

            console.log('foo', foo);
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
                variant="contained"
                disableElevation
                onClick={handlers.openMenu}
                startIcon={<AccessTimeIcon />}
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
