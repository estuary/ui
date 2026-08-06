import type { NavigationTabsProps } from 'src/components/shared/NavigationTabs/types';

import { Fragment, useMemo, useState } from 'react';

import { alpha, Box, Tab, tabClasses, Tabs, tabsClasses } from '@mui/material';

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

    return (
        <Box>
            {/* A filled pill for the selected tab instead of MUI's sliding
                underline. The underline needs a rule beneath the row to sit
                against, and that rule was one of three stacked across the top
                of a details page. A background carries the same "you are here"
                without needing anything drawn under it. */}
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
                    // nothing to scroll to, but still lays them out — 40px of
                    // reserved space each side. The left one is disabled
                    // whenever the row is scrolled fully left, which is its
                    // resting state, so it was silently indenting every tab row
                    // on the Admin pages past the page's own left edge. Taking
                    // it out of flow keeps the arrows for the case they exist
                    // for and gives the space back the rest of the time.
                    [`& .${tabsClasses.scrollButtons}.Mui-disabled`]: {
                        display: 'none',
                    },
                    // Padding traded for margin, not added to it: 8px of
                    // padding either side plus 4px of margin is the same 24px
                    // per tab the underline version used, so the row is no
                    // wider — but adjacent pills now sit 8px apart instead of
                    // touching, which they did the moment a hovered tab
                    // neighboured the selected one.
                    [`& .${tabClasses.root}`]: {
                        borderRadius: 2,
                        minHeight: 0,
                        mx: 0.5,
                        px: 1,
                        py: 1,
                        textTransform: 'none',
                    },
                    [`& .${tabClasses.root}:first-of-type`]: { ml: 0 },
                    [`& .${tabClasses.root}:last-of-type`]: { mr: 0 },
                    [`& .${tabClasses.root}:hover:not(.${tabClasses.selected})`]:
                        {
                            backgroundColor: (theme) =>
                                alpha(theme.palette.text.primary, 0.04),
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
        </Box>
    );
}

export default NavigationTabs;
