import type { Dispatch, SetStateAction} from 'react';
import { useMemo } from 'react';

import { Box, Button, Tab, Tabs } from '@mui/material';

import { useIntl } from 'react-intl';

import type { TabOptions } from 'src/components/transformation/create/Config/types';
import type { MuiTabProps } from 'src/types';

interface CatalogTabsProps {
    selectedTab: number;
    setSelectedTab: Dispatch<SetStateAction<number>>;
}

export const tabProps: MuiTabProps<TabOptions>[] = [
    {
        label: 'newTransform.config.tab.basicSettings',
        value: 'basic',
    },
    {
        label: 'newTransform.config.tab.advancedSettings',
        value: 'advanced',
    },
];

function DerivationCatalogEditorTabs({
    selectedTab,
    setSelectedTab,
}: CatalogTabsProps) {
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
            <Tabs value={selectedTab} aria-label="derivation catalog tabs">
                {tabs}
            </Tabs>
        </Box>
    );
}

export default DerivationCatalogEditorTabs;
