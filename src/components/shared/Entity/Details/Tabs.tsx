import { useMemo, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import useEntityShouldShowLogs from 'src/hooks/details/useEntityShouldShowLogs';

function DetailTabs() {
    const intl = useIntl();

    const shouldShowLogs = useEntityShouldShowLogs();
    const [searchParams] = useSearchParams();
    const { pathname } = useLocation();

    const [selectedTab, setSelectedTab] = useState(0);

    const tabProps = useMemo(() => {
        const response = [
            {
                label: 'details.tabs.overview',
                path: 'overview',
            },
            {
                label: 'details.tabs.spec',
                path: 'spec',
            },
            {
                label: 'details.tabs.history',
                path: 'history',
            },
        ];

        if (shouldShowLogs) {
            response.push({
                label: 'details.tabs.ops',
                path: 'ops',
            });
        }

        return response;
    }, [shouldShowLogs]);

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => {
                // Since we have capture, materialization, and collection paths
                //  it is easier to just make the link go "up" once and then
                //  change the path. Hardcoding the search params here so they
                //  do not get removed during navigation.
                const to = `../${tabProp.path}?${searchParams}`;

                if (pathname.includes(tabProp.path)) {
                    setSelectedTab(index);
                }

                return (
                    <Tab
                        key={`details-tabs-${tabProp.label}`}
                        label={intl.formatMessage({
                            id: tabProp.label,
                        })}
                        component={Link}
                        to={to}
                    />
                );
            }),
        [intl, pathname, searchParams, tabProps]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                allowScrollButtonsMobile
                variant="scrollable"
                scrollButtons="auto"
                value={selectedTab}
            >
                {tabs}
            </Tabs>
        </Box>
    );
}

export default DetailTabs;
