import { useEffect, useMemo, useRef, useState } from 'react';

import { debounce, isEmpty } from 'lodash';
import { useQuery } from 'urql';

import { AlertConfigQuery } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

export function useInitializeAlertConfigs() {
    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const setGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.setGlobalPrefixSettings
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    const [debouncedPrefix, setDebouncedPrefix] = useState(catalogPrefix);

    const updateDebouncedPrefix = useRef(
        debounce((prefix) => {
            setDebouncedPrefix(prefix);
        }, 750)
    );

    const settingsDefined = useMemo(
        () =>
            debouncedPrefix.length > 0 &&
            !isEmpty(mutableSubscriptionMetadata.settings),
        [debouncedPrefix, mutableSubscriptionMetadata]
    );

    // TODO: Add error handling.
    const [{ data, fetching }] = useQuery({
        pause: !debouncedPrefix || settingsDefined,
        query: AlertConfigQuery,
        variables: {
            filter: { catalogPrefixOrName: { startsWith: debouncedPrefix } },
        },
    });

    useEffect(() => {
        updateDebouncedPrefix.current(catalogPrefix);
    }, [catalogPrefix, updateDebouncedPrefix]);

    useEffect(() => {
        if (
            debouncedPrefix === catalogPrefix &&
            !settingsDefined &&
            !fetching &&
            data?.alertConfigs &&
            data.alertConfigs.edges.length > 0
        ) {
            setGlobalPrefixSettings(
                data.alertConfigs.edges[0].node.effective.config
            );
        }
    }, [
        catalogPrefix,
        data,
        debouncedPrefix,
        fetching,
        setGlobalPrefixSettings,
        settingsDefined,
    ]);

    return { loading: fetching || !data };
}
