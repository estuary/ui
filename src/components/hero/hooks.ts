import { MuiTabProps } from 'types';
import { NumberParam, useQueryParam } from 'use-query-params';
import { TabOptions } from './types';

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
    const [activeTab, setActiveTab] = useQueryParam('activeTab', NumberParam);

    return { activeTab: activeTab ?? 0, setActiveTab, tabs: TABS };
}
