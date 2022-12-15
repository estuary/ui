import { Box, Button, Tab, Tabs } from '@mui/material';
import { MuiTabProps } from 'components/editor/Bindings/types';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useIntl } from 'react-intl';

interface BindingTabsProps {
    selectedTab: number;
    setSelectedTab: Dispatch<SetStateAction<number>>;
}

export const tabProps: MuiTabProps[] = [
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
