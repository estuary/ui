import type { NavigationTabsProps } from 'src/components/shared/NavigationTabs/types';

import { Fragment, useMemo, useState } from 'react';

import { alpha, Tab, tabClasses, Tabs, tabsClasses } from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

function NavigationTabs({
    getPath,
    keyPrefix,
    tabs,
    TabsProps,
}: NavigationTabsProps) {
    const intl = useIntl();
    const [selectedTab, setSelectedTab] = useState(0);
    const { pathname } = useLocation();

    const tabsRendered = useMemo(
        () =>
            tabs.map(
                ({ labelMessageId, path, wrapperProps, Wrapper }, index) => {
                    const to = getPath ? getPath(path) : path;
                    const WrapperElement = Wrapper ?? Fragment;

                    if (pathname.includes(path)) {
                        setSelectedTab(index);
                    }

                    return (
                        <Tab
                            key={`${keyPrefix}-${labelMessageId}-${index}`}
                            label={
                                <WrapperElement {...(wrapperProps ?? {})}>
                                    {intl.formatMessage({
                                        id: labelMessageId,
                                    })}
                                </WrapperElement>
                            }
                            component={Link}
                            to={to}
                        />
                    );
                }
            ),
        [getPath, intl, keyPrefix, pathname, tabs]
    );

    // A filled pill for the selected tab instead of MUI's sliding underline.
    // The underline needs a rule beneath the row to sit against, and that rule
    // was one of three stacked across the top of a details page.
    return (
        <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            {...(TabsProps ?? {})}
            value={selectedTab}
            sx={{
                'minHeight': 0,
                [`& .${tabsClasses.indicator}`]: { display: 'none' },
                // `scrollButtons="auto"` disables the arrows when there is
                // nothing to scroll to but still lays them out, 40px each side.
                // The left one is disabled whenever the row is scrolled fully
                // left — its resting state — so it was indenting every tab row
                // past its own page's left edge with no overflow in sight.
                //
                // MUI keeps the box to stop the row jumping as the arrows
                // toggle, so this trades that: a row long enough to scroll will
                // shift 40px the first time it does. Worth it while no row in
                // the app overflows at desktop width.
                [`& .${tabsClasses.scrollButtons}.Mui-disabled`]: {
                    display: 'none',
                },
                // 8px between pills, flush at both ends. They touched the
                // moment a hovered tab neighboured the selected one.
                [`& .${tabsClasses.flexContainer}`]: { gap: 1 },
                [`& .${tabClasses.root}`]: {
                    borderRadius: 2,
                    minHeight: 0,
                    p: 1,
                    textTransform: 'none',
                },
                [`& .${tabClasses.root}:hover:not(.${tabClasses.selected})`]: {
                    backgroundColor: 'action.hover',
                },
                [`& .${tabClasses.selected}`]: {
                    backgroundColor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'light' ? 0.09 : 0.2
                        ),
                },
                ...((TabsProps?.sx as any) ?? {}),
            }}
        >
            {tabsRendered}
        </Tabs>
    );
}

export default NavigationTabs;
