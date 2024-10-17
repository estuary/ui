import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { DataByHourRange, DataGrains } from 'components/graphs/types';
import { cardHeaderSx, linkButtonSx } from 'context/Theme';
import { Calendar } from 'iconoir-react';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useDetailsUsageStore,
    useDetailsUsageStoreRangeSettings,
} from 'stores/DetailsUsage/useDetailsUsageStore';

function HourlyRangeFilter() {
    const intl = useIntl();

    const range = useDetailsUsageStoreRangeSettings();

    const [setRange] = useDetailsUsageStore((store) => [store.setRange]);

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
            <Typography id="hourly-filter-selector__label" sx={cardHeaderSx}>
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
                endIcon={<Calendar style={{ fontSize: 13 }} />}
                onClick={handlers.openMenu}
                sx={{ ...linkButtonSx }}
            >
                {intl.formatMessage(
                    {
                        id: `detailsPanel.recentUsage.filter.label.${range.relativeUnit}`,
                    },
                    { range: range.amount }
                )}
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
                <MenuItem
                    onClick={() =>
                        handlers.setFilter({
                            amount: 6,
                            grain: DataGrains.hourly,
                        })
                    }
                >
                    {intl.formatMessage(
                        { id: 'detailsPanel.recentUsage.filter.label.hours' },
                        {
                            range: 6,
                        }
                    )}
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        handlers.setFilter({
                            amount: 12,
                            grain: DataGrains.hourly,
                        })
                    }
                >
                    {intl.formatMessage(
                        { id: 'detailsPanel.recentUsage.filter.label.hours' },
                        {
                            range: 12,
                        }
                    )}
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        handlers.setFilter({
                            amount: 24,
                            grain: DataGrains.hourly,
                        })
                    }
                >
                    {intl.formatMessage(
                        { id: 'detailsPanel.recentUsage.filter.label.hours' },
                        {
                            range: 24,
                        }
                    )}
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        handlers.setFilter({
                            amount: 48,
                            grain: DataGrains.hourly,
                        })
                    }
                >
                    {intl.formatMessage(
                        { id: 'detailsPanel.recentUsage.filter.label.hours' },
                        {
                            range: 48,
                        }
                    )}
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        handlers.setFilter({
                            amount: 30,
                            grain: DataGrains.daily,
                        })
                    }
                >
                    {intl.formatMessage(
                        {
                            id: 'detailsPanel.recentUsage.filter.label.days',
                        },
                        {
                            range: 30,
                        }
                    )}
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default HourlyRangeFilter;
