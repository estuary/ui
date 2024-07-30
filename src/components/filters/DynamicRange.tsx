import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Grains } from 'api/stats';
import useDashboardUsageStore, {
    PresentDateRange,
} from 'components/dashboard/useDashboardUsageStore';
import { cardHeaderSx, linkButtonSx } from 'context/Theme';
import {
    endOfToday,
    endOfYear,
    getDaysInMonth,
    isSaturday,
    lastDayOfMonth,
    nextSaturday,
} from 'date-fns';
import { Calendar } from 'iconoir-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

export default function DynamicRangeFilter() {
    const [setRange, setGrain, setEndDate] = useDashboardUsageStore((store) => [
        store.setRange,
        store.setGrain,
        store.setEndDate,
    ]);

    const [statFilter, setStatFilter] = useDashboardUsageStore((store) => [
        store.statFilter,
        store.setStatFilter,
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
        setFilter: (
            newRange: number,
            grain: Grains,
            endDate: Date,
            filter: PresentDateRange
        ) => {
            setEndDate(endDate);
            setStatFilter(filter);

            setRange(newRange);
            setGrain(grain);

            handlers.closeMenu();
        },
    };

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography id="hourly-filter-selector__label" sx={cardHeaderSx}>
                <FormattedMessage id="home.dashboard.dataTrendsGraph.title.prefix" />
            </Typography>

            <Button
                id="dynamic-range-filter-selector-button"
                aria-controls={
                    open ? 'dynamic-range-filter-selector-menu' : undefined
                }
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                aria-labelledby="dynamic-range-filter-selector__label"
                variant="text"
                disableElevation
                endIcon={<Calendar style={{ fontSize: 13 }} />}
                onClick={handlers.openMenu}
                sx={{ ...linkButtonSx }}
            >
                <FormattedMessage id={`filter.time.${statFilter}`} />
            </Button>

            <Menu
                id="dynamic-range-filter-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem
                    onClick={() => {
                        const endDate = endOfToday();

                        handlers.setFilter(24, 'hourly', endDate, 'today');
                    }}
                >
                    <FormattedMessage id="filter.time.today" />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        const today = new Date();

                        const endDate = isSaturday(today)
                            ? today
                            : nextSaturday(today);

                        handlers.setFilter(7, 'daily', endDate, 'thisWeek');
                    }}
                >
                    <FormattedMessage id="filter.time.thisWeek" />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        const today = new Date();
                        const endDate = lastDayOfMonth(today);

                        handlers.setFilter(
                            getDaysInMonth(endDate),
                            'daily',
                            endDate,
                            'thisMonth'
                        );
                    }}
                >
                    <FormattedMessage id="filter.time.thisMonth" />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        const today = new Date();
                        const endDate = endOfYear(today);

                        handlers.setFilter(12, 'monthly', endDate, 'thisYear');
                    }}
                >
                    <FormattedMessage id="filter.time.thisYear" />
                </MenuItem>
            </Menu>
        </Stack>
    );
}
