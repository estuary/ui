import type { AlertConfigOptions } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { WithRequiredProperty } from 'src/types/utils';

import { useEffect, useMemo, useRef, useState } from 'react';

import { debounce, isEmpty } from 'lodash';
import { useUnmount } from 'react-use';
import { useQuery } from 'urql';

import { AlertConfigQuery, EffectiveAlertConfigQuery } from 'src/api/alerts';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { PREFIX_NAME_PATTERN } from 'src/validation';

const namePattern = new RegExp(
    `^(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}/?$`
);

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
    const prefixErrors = useAlertSubscriptionsStore(
        (state) => state.prefixErrors
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
            settingsDefined ||
            !namePattern.test(debouncedPrefix) ||
            prefixErrors.length > 0,
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
            settingsDefined ||
            !namePattern.test(debouncedPrefix) ||
            prefixErrors.length > 0,
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
        const errors = [error, effectiveConfigResponse?.error].filter(
            (err) => typeof err !== 'undefined'
        );

        setServerError(
            !fetching && !effectiveConfigResponse.fetching && errors.length > 0
                ? errors
                : []
        );
    }, [
        effectiveConfigResponse?.error,
        effectiveConfigResponse.fetching,
        error,
        fetching,
        setServerError,
    ]);

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
