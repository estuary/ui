import type { DataByHourRange } from 'src/components/graphs/types';

import React, { useState } from 'react';

import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { Calendar } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { DataGrains } from 'src/components/graphs/types';
import { cardHeaderSx, linkButtonSx } from 'src/context/Theme';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

// TODO (details range) - we should probably not add many more predefined ranges and
//  start allowing a user to enter their own range manually.
function DetailsRange() {
    const intl = useIntl();

    const [range, setRange] = useDetailsUsageStore(
        useShallow((state) => [state.range, state.setRange])
    );
    const { relativeUnit } = LUXON_GRAIN_SETTINGS[range.grain];

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
                        id: `detailsPanel.recentUsage.filter.label.${relativeUnit}`,
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

export default DetailsRange;
