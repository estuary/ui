import { Button, Tab, Tabs } from '@mui/material';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { MuiTabProps } from 'types';

export type TabOptions = 'overview' | 'details';

interface HeroTabsProps {
    selectedTab: number;
    setSelectedTab: Dispatch<SetStateAction<number>>;
}

export const tabProps: MuiTabProps<TabOptions>[] = [
    {
        label: 'home.hero.tab.companyOverview',
        value: 'overview',
    },
    {
        label: 'home.hero.tab.companyDetails',
        value: 'details',
    },
];

function HeroTabs({ selectedTab, setSelectedTab }: HeroTabsProps) {
    const intl = useIntl();

    const tabs = useMemo(
        () =>
            tabProps.map((tabProp, index) => (
                <Tab
                    key={`welcome-card-tabs-${tabProp.label}`}
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
        <Tabs centered value={selectedTab} aria-label="welcome card tabs">
            {tabs}
        </Tabs>
    );
}

export default HeroTabs;
