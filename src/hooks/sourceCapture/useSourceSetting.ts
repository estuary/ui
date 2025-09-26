import { useCallback, useMemo } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useDraftUpdater from 'src/hooks/useDraftUpdater';
import {
    readSourceCaptureDefinitionFromSpec,
    updateSourceCapture,
} from 'src/utils/entity-utils';

export default function useSourceSetting<T = any>(
    settingKey:
        | 'capture'
        | 'deltaUpdates'
        | 'fieldsRecommended'
        | 'targetNaming'
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

    const currentSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec
                ? draftSpecs[0].spec
                : undefined,
        [draftSpecs]
    );

    const currentSetting = useMemo(() => {
        if (currentSpec) {
            const currentSourceCapture =
                readSourceCaptureDefinitionFromSpec(currentSpec);

            if (settingKey === 'targetNaming') {
                const oldProperty = currentSourceCapture?.['targetSchema'];
                const newProperty = currentSourceCapture?.[settingKey];

                // Try using the oldProperty first so we can maintain the setting the user used
                return (oldProperty ?? newProperty) as T;
            }

            return currentSourceCapture?.[settingKey] as T;
        }

        return undefined;
    }, [currentSpec, settingKey]);

    return {
        currentSetting,
        updateSourceSetting,
    };
}
