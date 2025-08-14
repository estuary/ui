import type { NavigationTabProps } from 'src/components/shared/NavigationTabs/types';

import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import AlertsAreActiveBadge from 'src/components/shared/AlertsAreActiveBadge';
import useEntityShouldShowLogs from 'src/components/shared/Entity/Details/useEntityShouldShowLogs';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const TAB_KEY = 'details-tabs';
function DetailTabs() {
    const [searchParams] = useSearchParams();
    const shouldShowLogs = useEntityShouldShowLogs();
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const getPath = useCallback(
        (path: string) => {
            // Since we have capture, materialization, and collection paths
            //  it is easier to just make the link go "up" once and then
            //  change the path. Hardcoding the search params here so they
            //  do not get removed during navigation.
            return `../${path}?${searchParams}`;
        },
        [searchParams]
    );

    const tabProps = useMemo(() => {
        const response: NavigationTabProps[] = [
            {
                labelMessageId: 'details.tabs.overview',
                path: 'overview',
            },
            {
                Wrapper: AlertsAreActiveBadge,
                wrapperProps: {
                    prefixes: [catalogName],
                },
                labelMessageId: 'details.tabs.alerts',
                path: 'alerts',
            },
            {
                labelMessageId: 'details.tabs.spec',
                path: 'spec',
            },
        ];

        // TODO (details:history) not currently live but is here to make sure it can render
        if (hasSupportRole) {
            response.push({
                labelMessageId: 'details.tabs.history',
                path: 'history',
            });
        }

        if (shouldShowLogs) {
            response.push({
                labelMessageId: 'details.tabs.ops',
                path: 'ops',
            });
        }

        return response;
    }, [hasSupportRole, shouldShowLogs]);

    return (
        <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} getPath={getPath} />
    );
}

export default DetailTabs;
