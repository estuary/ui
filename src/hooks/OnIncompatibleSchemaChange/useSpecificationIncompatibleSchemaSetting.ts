import type { AutoCompleteOptionForIncompatibleSchemaChange } from 'src/components/incompatibleSchemaChange/types';

import { useCallback } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useDraftUpdater from 'src/hooks/useDraftUpdater';
import { addOrRemoveOnIncompatibleSchemaChange } from 'src/utils/entity-utils';

export default function useSpecificationIncompatibleSchemaSetting() {
    // Draft Editor Store
    const draftUpdater = useDraftUpdater();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const updateOnIncompatibleSchemaChange = useCallback(
        async (
            value:
                | AutoCompleteOptionForIncompatibleSchemaChange['val']
                | undefined
        ) => {
            return draftUpdater(
                (spec) => addOrRemoveOnIncompatibleSchemaChange(spec, value),
                { spec_type: 'materialization' }
            );
        },
        [draftUpdater]
    );

    const currentSetting =
        draftSpecs.length > 0 && draftSpecs[0].spec
            ? draftSpecs[0].spec.onIncompatibleSchemaChange
            : '';

    return {
        currentSetting,
        updateOnIncompatibleSchemaChange,
    };
}
