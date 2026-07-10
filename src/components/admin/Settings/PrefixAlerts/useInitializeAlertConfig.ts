import type { Schema } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { debounce, isEmpty } from 'lodash';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { basicSort_stringLength } from 'src/utils/misc-utils';

export function useInitializeAlertConfig() {
    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const setGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.setGlobalPrefixSettings
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const immutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.subscriptionMetadata
    );

    const [debouncedPrefix, setDebouncedPrefix] = useState(catalogPrefix);
    const [implicitSettings, setImplicitSettings] = useState<Schema>({});

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

    useEffect(() => {
        updateDebouncedPrefix.current(catalogPrefix);
    }, [catalogPrefix, updateDebouncedPrefix]);

    useEffect(() => {
        if (debouncedPrefix === catalogPrefix && !settingsDefined) {
            const sortedImmutableSubscriptionMetadata = Object.entries(
                immutableSubscriptionMetadata
            )
                .filter(([_prefix, metadata]) => !isEmpty(metadata.settings))
                .sort((first, second) => {
                    return basicSort_stringLength(first[0], second[0], 'desc');
                });

            const matchedImmutableSubscriptionMetadata =
                sortedImmutableSubscriptionMetadata.find(
                    ([prefix, _metadata]) => catalogPrefix.startsWith(prefix)
                );

            if (!matchedImmutableSubscriptionMetadata) {
                return;
            }

            const [matchedPrefix, _matchedMetadata] =
                matchedImmutableSubscriptionMetadata;

            setImplicitSettings(
                immutableSubscriptionMetadata[matchedPrefix].settings
            );
        }
    }, [
        catalogPrefix,
        debouncedPrefix,
        immutableSubscriptionMetadata,
        setGlobalPrefixSettings,
        settingsDefined,
    ]);

    return {
        loading: debouncedPrefix !== catalogPrefix,
        evaluatedSettings: settingsDefined
            ? mutableSubscriptionMetadata.settings
            : implicitSettings,
    };
}
