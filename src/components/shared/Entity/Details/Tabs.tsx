import { Box, Tab, Tabs } from '@mui/material';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import useConstant from 'use-constant';

function DetailTabs() {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const { pathname } = useLocation();
    const [selectedTab, setSelectedTab] = useState(0);

    const tabProps = useConstant(() => {
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
                label: 'details.tabs.shardStatus',
                path: 'shards',
            },
            {
                label: 'details.tabs.history',
                path: 'history',
            },
        ];

        return response;
    });

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => {
                if (pathname.includes(tabProp.path)) {
                    setSelectedTab(index);
                }

                return (
                    <Tab
                        key={`details-tabs-${tabProp.label}`}
                        label={intl.formatMessage({
                            id: tabProp.label,
                        })}
                        iconPosition="start"
                        component={Link}
                        to={`${tabProp.path}?${searchParams}`}
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
