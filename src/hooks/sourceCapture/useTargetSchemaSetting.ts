import type { AutoCompleteOption } from 'src/components/materialization/source/targetSchema/types';

import { useCallback, useMemo } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useSpecPropertyUpdater from 'src/hooks/usePropertyManager';
import {
    readSourceCaptureFromSpec,
    updateSourceCapture,
} from 'src/utils/entity-utils';

export default function useTargetSchemaSetting() {
    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const propertyUpdater = useSpecPropertyUpdater();

    const currentSetting = useMemo(() => {
        if (!draftSpec || !draftSpec.spec) {
            return undefined;
        }

        return readSourceCaptureFromSpec(draftSpec.spec)?.targetSchema;
    }, [draftSpec]);

    const updateTargetSchemaSetting = useCallback(
        async (value: AutoCompleteOption['val'] | undefined) => {
            return propertyUpdater(
                (spec) =>
                    updateSourceCapture(spec, {
                        targetSchema: value,
                    }),
                { spec_type: 'materialization' }
            );
        },
        [propertyUpdater]
    );

    return {
        currentSetting,
        updateTargetSchemaSetting,
    };
}
