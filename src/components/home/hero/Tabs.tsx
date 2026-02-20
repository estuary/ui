import { useMemo } from 'react';

import { Tab, Tabs } from '@mui/material';

import { useIntl } from 'react-intl';

import { useHeroTabs } from 'src/components/home/hero/hooks';

function HeroTabs() {
    const intl = useIntl();
    const { activeTab, setActiveTab, tabs } = useHeroTabs();

    const renderedTabs = useMemo(
        () =>
            tabs.map((tabProp, index) => (
                <Tab
                    key={`welcome-card-tabs-${index}`}
                    label={intl.formatMessage({
                        id: tabProp.label,
                    })}
                    onClick={() => setActiveTab(tabProp.value)}
                    value={tabProp.value}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    }}
                />
            )),
        [intl, setActiveTab, tabs]
    );

    return (
        <Tabs
            value={activeTab}
            aria-label={intl.formatMessage({ id: 'home.hero.tab.ariaLabel' })}
        >
            {renderedTabs}
        </Tabs>
    );
}

export default HeroTabs;
