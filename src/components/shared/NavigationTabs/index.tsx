import type { NavigationTabsProps } from 'src/components/shared/NavigationTabs/types';

import { Fragment, useMemo, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';

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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                allowScrollButtonsMobile
                variant="scrollable"
                scrollButtons="auto"
                {...(TabsProps ?? {})}
                value={selectedTab}
            >
                {tabsRendered}
            </Tabs>
        </Box>
    );
}

export default NavigationTabs;
