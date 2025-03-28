import type { TabOptions } from 'src/components/home/hero/types';
import type { MuiTabProps } from 'src/types';

import { StringParam, useQueryParam, withDefault } from 'use-query-params';

export const TABS: MuiTabProps<TabOptions>[] = [
    {
        label: 'home.hero.tab.companyOverview',
        value: 'overview',
    },
    {
        label: 'home.hero.tab.companyDetails',
        value: 'details',
    },
    {
        label: 'home.hero.tab.demo',
        value: 'demo',
    },
];

export function useHeroTabs() {
    const [activeTab, setActiveTab] = useQueryParam(
        'activeTab',
        withDefault(StringParam, TABS[0].value)
    );

    return {
        activeTab,
        setActiveTab,
        openDetails: () => {
            setActiveTab('details');
        },
        tabs: TABS,
    };
}
