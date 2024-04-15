import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { DataByHourRange } from 'components/graphs/types';
import useDetailsUsageStore from 'components/shared/Entity/Details/Usage/useDetailsUsageStore';
import { linkButtonSx } from 'context/Theme';
import { Filter } from 'iconoir-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function HourlyRangeFilter() {
    const [range, setRange] = useDetailsUsageStore((store) => [
        store.range,
        store.setRange,
    ]);

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
            <Typography id="hourly-filter-selector__label">
                <FormattedMessage id="detailsPanel.recentUsage.title.prefix" />
            </Typography>

            <Button
                id="hourly-usage-filter-selector-button"
                aria-controls={
                    open ? 'hourly-usage-filter-selector-menu' : undefined
                }
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                aria-labelledby="hourly-filter-selector__label"
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
                <MenuItem onClick={() => handlers.setFilter(48)}>
                    <FormattedMessage
                        id="detailsPanel.recentUsage.filter.label"
                        values={{
                            range: 48,
                        }}
                    />
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default HourlyRangeFilter;
