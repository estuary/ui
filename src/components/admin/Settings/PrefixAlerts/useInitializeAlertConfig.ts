import type { AlertConfigOptions } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { WithRequiredProperty } from 'src/types/utils';

import { useEffect, useMemo, useRef, useState } from 'react';

import { debounce, isEmpty } from 'lodash';
import { useUnmount } from 'react-use';
import { useQuery } from 'urql';

import { AlertConfigQuery, EffectiveAlertConfigQuery } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

export function useInitializeAlertConfig() {
    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const initializeGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.initializeGlobalPrefixSettings
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setServerErrors
    );

    const [debouncedPrefix, setDebouncedPrefix] = useState(catalogPrefix);
    const [configs, setConfigs] = useState<
        WithRequiredProperty<AlertConfigOptions, 'standard'>
    >({ effective: {}, standard: null });

    const updateDebouncedPrefix = useRef(
        debounce((prefix) => {
            setDebouncedPrefix(prefix);
        }, 750)
    );

    const settingsDefined = useMemo(
        () =>
            debouncedPrefix.length > 0 &&
            !isEmpty(mutableSubscriptionMetadata.configs.effective),
        [debouncedPrefix, mutableSubscriptionMetadata]
    );

    const [{ data, error, fetching }] = useQuery({
        pause:
            !debouncedPrefix ||
            !debouncedPrefix.endsWith('/') ||
            settingsDefined,
        query: AlertConfigQuery,
        variables: {
            filter: { catalogPrefixOrName: { in: [debouncedPrefix] } },
            first: 100,
        },
    });

    const [effectiveConfigResponse] = useQuery({
        pause:
            !debouncedPrefix ||
            !debouncedPrefix.endsWith('/') ||
            settingsDefined,
        query: EffectiveAlertConfigQuery,
        variables: {
            catalogPrefixOrName: debouncedPrefix,
        },
    });

    useEffect(() => {
        updateDebouncedPrefix.current(catalogPrefix);
    }, [catalogPrefix, updateDebouncedPrefix]);

    useUnmount(() => {
        updateDebouncedPrefix.current.cancel();
    });

    useEffect(() => {
        if (!fetching && error) {
            setServerError([error]);
        }
    }, [error, fetching, setServerError]);

    useEffect(() => {
        if (debouncedPrefix !== catalogPrefix || settingsDefined || fetching) {
            return;
        }

        if (data?.alertConfigs && data.alertConfigs.edges.length > 0) {
            const alertConfigData: {
                configs: WithRequiredProperty<AlertConfigOptions, 'standard'>;
                prefix: string;
            }[] = data.alertConfigs.edges.map(({ node }) => ({
                configs: {
                    effective: node.effective.config,
                    standard: node.config,
                },
                prefix: node.catalogPrefixOrName,
            }));

            const targetConfigs = alertConfigData.find(
                (datum) => datum.prefix === debouncedPrefix
            )?.configs;

            if (targetConfigs) {
                setConfigs(targetConfigs);
                initializeGlobalPrefixSettings(targetConfigs);
            }
        } else if (
            !effectiveConfigResponse.fetching &&
            effectiveConfigResponse?.data?.effectiveAlertConfig
        ) {
            const targetConfigs: WithRequiredProperty<
                AlertConfigOptions,
                'standard'
            > = {
                effective:
                    effectiveConfigResponse.data.effectiveAlertConfig.config,
                standard: null,
            };

            initializeGlobalPrefixSettings(targetConfigs);
            setConfigs(targetConfigs);
        }
    }, [
        catalogPrefix,
        data,
        debouncedPrefix,
        effectiveConfigResponse?.data,
        effectiveConfigResponse.fetching,
        fetching,
        initializeGlobalPrefixSettings,
        settingsDefined,
    ]);

    return {
        loading:
            debouncedPrefix !== catalogPrefix ||
            !debouncedPrefix.endsWith('/') ||
            fetching ||
            effectiveConfigResponse.fetching,
        configs,
    };
}
