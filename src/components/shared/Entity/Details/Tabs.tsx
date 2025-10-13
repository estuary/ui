import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import AlertsAreActiveBadge from 'src/components/shared/AlertsAreActiveBadge';
import NavigationTabs from 'src/components/shared/NavigationTabs';
import useEntityShouldShowLogs from 'src/hooks/details/useEntityShouldShowLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

const TAB_KEY = 'details-tabs';
function DetailTabs() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const shouldShowLogs = useEntityShouldShowLogs();
    const [searchParams] = useSearchParams();

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
        const response = [
            {
                labelMessageId: 'details.tabs.overview',
                path: 'overview',
            },
            {
                Wrapper: AlertsAreActiveBadge,
                wrapperProps: {
                    prefix: catalogName,
                },
                labelMessageId: 'details.tabs.alerts',
                path: 'alerts',
            },
            {
                labelMessageId: 'details.tabs.spec',
                path: 'spec',
            },
            {
                labelMessageId: 'details.tabs.history',
                path: 'history',
            },
        ];

        if (shouldShowLogs) {
            response.push({
                labelMessageId: 'details.tabs.ops',
                path: 'ops',
            });
        }

        return response;
    }, [catalogName, shouldShowLogs]);

    return (
        <NavigationTabs keyPrefix={TAB_KEY} tabs={tabProps} getPath={getPath} />
    );
}

export default DetailTabs;
