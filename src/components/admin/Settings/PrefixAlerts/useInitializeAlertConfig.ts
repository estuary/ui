import type { GlobalSettingEvaluationResult } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect, useRef, useState } from 'react';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateGlobalPrefixSettings } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateGlobalPrefixSettings';

export function useInitializeAlertConfig() {
    const { evaluateGlobalPrefixSettings } = useEvaluateGlobalPrefixSettings();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );

    const [debouncedPrefix, setDebouncedPrefix] = useState(catalogPrefix);
    const [configs, setConfigs] = useState<GlobalSettingEvaluationResult>({
        explicit: { effective: {}, standard: {} },
        implicit: { effective: {}, standard: {} },
    });

    const updateDebouncedPrefix = useRef(
        debounce((prefix) => {
            setDebouncedPrefix(prefix);
        }, 750)
    );

    useEffect(() => {
        updateDebouncedPrefix.current(catalogPrefix);
    }, [catalogPrefix, updateDebouncedPrefix]);

    useUnmount(() => {
        updateDebouncedPrefix.current.cancel();
    });

    useEffect(() => {
        if (debouncedPrefix === catalogPrefix) {
            const prefixConfigs = evaluateGlobalPrefixSettings(debouncedPrefix);

            setConfigs(prefixConfigs);
        }
    }, [catalogPrefix, debouncedPrefix, evaluateGlobalPrefixSettings]);

    return {
        loading: debouncedPrefix !== catalogPrefix,
        configs,
    };
}
