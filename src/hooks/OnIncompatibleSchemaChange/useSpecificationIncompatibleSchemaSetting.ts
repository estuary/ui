import type { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';

import { useCallback, useMemo } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import useSpecPropertyUpdater from 'src/hooks/usePropertyManager';
import { addOrRemoveOnIncompatibleSchemaChange } from 'src/utils/entity-utils';

export default function useSpecificationIncompatibleSchemaSetting() {
    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const propertyUpdater = useSpecPropertyUpdater();

    const updateOnIncompatibleSchemaChange = useCallback(
        async (value: AutoCompleteOption['val'] | undefined) => {
            return propertyUpdater(
                (spec) => addOrRemoveOnIncompatibleSchemaChange(spec, value),
                { spec_type: 'materialization' }
            );
        },
        [propertyUpdater]
    );

    return {
        currentSetting: draftSpec?.spec?.onIncompatibleSchemaChange
            ? draftSpec.spec.onIncompatibleSchemaChange
            : '',
        updateOnIncompatibleSchemaChange,
    };
}
