import { Box, Button, Tab, Tabs } from '@mui/material';
import { TabOptions } from 'components/editor/Bindings/types';
import { useEntityType } from 'context/EntityContext';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { MuiTabProps } from 'types';

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
    const entityType = useEntityType();

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
        [setSelectedTab, entityType, intl]
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
