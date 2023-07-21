import React, { useState } from 'react';

import { Filter } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Button, Menu, MenuItem, Stack } from '@mui/material';

import { DataByHourRange } from 'components/graphs/types';

import { linkButtonSx } from 'context/Theme';

interface Props {
    range: DataByHourRange;
    setRange: (range: DataByHourRange) => void;
}

function HourlyRangeFilter({ range, setRange }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        setFilter: (newRange: DataByHourRange) => {
            setRange(newRange);
            handlers.closeMenu();
        },
    };

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FormattedMessage id="detailsPanel.recentUsage.title.prefix" />

            <Button
                id="hourly-usage-filter-selector-button"
                aria-controls={
                    open ? 'hourly-usage-filter-selector-menu' : undefined
                }
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="text"
                disableElevation
                endIcon={<Filter style={{ fontSize: 13 }} />}
                onClick={handlers.openMenu}
                sx={{ ...linkButtonSx }}
            >
                <FormattedMessage
                    id="detailsPanel.recentUsage.filter.label"
                    values={{
                        range,
                    }}
                />
            </Button>

            <Menu
                id="hourly-usage-filter-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={() => handlers.setFilter(6)}>
                    <FormattedMessage
                        id="detailsPanel.recentUsage.filter.label"
                        values={{
                            range: 6,
                        }}
                    />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter(12)}>
                    <FormattedMessage
                        id="detailsPanel.recentUsage.filter.label"
                        values={{
                            range: 12,
                        }}
                    />
                </MenuItem>
                <MenuItem onClick={() => handlers.setFilter(24)}>
                    <FormattedMessage
                        id="detailsPanel.recentUsage.filter.label"
                        values={{
                            range: 24,
                        }}
                    />
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default HourlyRangeFilter;
