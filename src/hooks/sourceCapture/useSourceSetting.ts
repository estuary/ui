import { useCallback } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useDraftUpdater from 'src/hooks/useDraftUpdater';
import {
    readSourceCaptureFromSpec,
    updateSourceCapture,
} from 'src/utils/entity-utils';

export default function useSourceSetting<T = any>(
    settingKey: 'targetSchema' | 'deltaUpdates' | 'capture'
) {
    const draftUpdater = useDraftUpdater();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const updateSourceSetting = useCallback(
        async (value: T | undefined) => {
            return draftUpdater(
                (spec) => {
                    return updateSourceCapture(spec, {
                        [settingKey]: value,
                    });
                },
                { spec_type: 'materialization' }
            );
        },
        [draftUpdater, settingKey]
    );

    const currentSetting =
        draftSpecs.length > 0 && draftSpecs[0].spec
            ? (readSourceCaptureFromSpec(draftSpecs[0].spec)?.[settingKey] as T)
            : undefined;

    return {
        currentSetting,
        updateSourceSetting,
    };
}
