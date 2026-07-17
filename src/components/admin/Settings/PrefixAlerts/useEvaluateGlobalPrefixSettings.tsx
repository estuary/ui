import type { GlobalSettingEvaluationResult } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useCallback } from 'react';

import { isEmpty } from 'lodash';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { basicSort_stringLength } from 'src/utils/misc-utils';

export function useEvaluateGlobalPrefixSettings() {
    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const immutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.subscriptionMetadata
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    const evaluateGlobalPrefixSettings = useCallback(
        (debouncedPrefix?: string) => {
            const settings: GlobalSettingEvaluationResult = {
                explicit: { effective: {}, standard: {} },
                implicit: { effective: {}, standard: {} },
            };
            const evaluatedPrefix = debouncedPrefix ?? catalogPrefix;

            if (evaluatedPrefix.length === 0) {
                return settings;
            }

            settings.explicit = mutableSubscriptionMetadata.configs;

            const sortedImmutablePrefixAndMetadata = Object.entries(
                immutableSubscriptionMetadata
            )
                .filter(
                    ([_prefix, metadata]) =>
                        !isEmpty(metadata.configs.effective)
                )
                .sort((first, second) => {
                    return basicSort_stringLength(first[0], second[0], 'desc');
                });

            const matchedImmutablePrefixAndMetadata =
                sortedImmutablePrefixAndMetadata.find(([prefix, _metadata]) =>
                    evaluatedPrefix.startsWith(prefix)
                );

            if (!matchedImmutablePrefixAndMetadata) {
                return settings;
            }

            const [matchedPrefix, _matchedMetadata] =
                matchedImmutablePrefixAndMetadata;

            settings.implicit =
                immutableSubscriptionMetadata[matchedPrefix].configs;

            settings.directImplicitMatch = evaluatedPrefix === matchedPrefix;

            return settings;
        },
        [
            catalogPrefix,
            immutableSubscriptionMetadata,
            mutableSubscriptionMetadata,
        ]
    );

    return { evaluateGlobalPrefixSettings };
}
