import { useCallback, useMemo } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useSpecPropertyUpdater from 'src/hooks/usePropertyManager';
import {
    readSourceCaptureFromSpec,
    updateSourceCapture,
} from 'src/utils/entity-utils';

export default function useSourceSetting<T = any>(
    settingKey: 'targetSchema' | 'deltaUpdates' | 'capture'
) {
    const propertyUpdater = useSpecPropertyUpdater();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const currentSetting = useMemo<T | undefined>(() => {
        if (!draftSpec || !draftSpec.spec) {
            return undefined;
        }

        const response = readSourceCaptureFromSpec(draftSpec.spec)?.[
            settingKey
        ] as T;

        return response;
    }, [draftSpec, settingKey]);

    const updateSourceSetting = useCallback(
        async (value: T | undefined) => {
            return propertyUpdater(
                (spec) => {
                    return updateSourceCapture(spec, {
                        [settingKey]: value,
                    });
                },
                { spec_type: 'materialization' }
            );
        },
        [propertyUpdater, settingKey]
    );

    return {
        currentSetting,
        updateSourceSetting,
    };
}
