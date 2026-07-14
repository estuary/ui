import type { Schema } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import { debounce, isEmpty } from 'lodash';
import { useUnmount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateGlobalPrefixSettings } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateGlobalPrefixSettings';

export function useInitializeAlertConfig() {
    const { evaluateGlobalPrefixSettings } = useEvaluateGlobalPrefixSettings();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );

    const [debouncedPrefix, setDebouncedPrefix] = useState(catalogPrefix);
    const [evaluatedSettings, setEvaluatedSettings] = useState<Schema>({});

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
            const { explicit: explicitSettings, implicit: implicitSettings } =
                evaluateGlobalPrefixSettings(debouncedPrefix);

            setEvaluatedSettings(
                isEmpty(explicitSettings) ? implicitSettings : explicitSettings
            );
        }
    }, [catalogPrefix, debouncedPrefix, evaluateGlobalPrefixSettings]);

    return {
        loading: debouncedPrefix !== catalogPrefix,
        evaluatedSettings,
    };
}
