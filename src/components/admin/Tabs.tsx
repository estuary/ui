import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    selectedTab: number;
}

function AdminTabs({ selectedTab }: Props) {
    const intl = useIntl();
    const [value] = useState(selectedTab);

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} aria-label="basic tabs example">
                <Tab
                    label={intl.formatMessage({
                        id: 'routeTitle.admin.accessGrants',
                    })}
                />
                <Tab
                    label={intl.formatMessage({ id: 'routeTitle.admin.api' })}
                />
            </Tabs>
        </Box>
    );
}

export default AdminTabs;
