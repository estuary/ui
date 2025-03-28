import type { Dispatch, SetStateAction} from 'react';
import { useMemo } from 'react';

import { Box, Button, Tab, Tabs } from '@mui/material';

import { useIntl } from 'react-intl';

import type { TabOptions } from 'src/components/editor/Bindings/types';
import type { MuiTabProps } from 'src/types';

interface BindingTabsProps {
    selectedTab: number;
    setSelectedTab: Dispatch<SetStateAction<number>>;
}

export const tabProps: MuiTabProps<TabOptions>[] = [
    {
        label: 'workflows.collectionSelector.tab.resourceConfig',
        value: 'config',
    },
    {
        label: 'workflows.collectionSelector.tab.collectionSchema',
        value: 'schema',
    },
];

function BindingsTabs({ selectedTab, setSelectedTab }: BindingTabsProps) {
    const intl = useIntl();

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => (
                <Tab
                    key={`collection-selection-tabs-${tabProp.label}`}
                    label={intl.formatMessage({
                        id: tabProp.label,
                    })}
                    component={Button}
                    onClick={() => setSelectedTab(index)}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    }}
                />
            )),
        [setSelectedTab, intl]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} aria-label="collection selection tabs">
                {tabs}
            </Tabs>
        </Box>
    );
}

export default BindingsTabs;
