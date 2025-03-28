import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';
import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { Schema } from 'src/types';
import { addOrRemoveOnIncompatibleSchemaChange } from 'src/utils/entity-utils';

export default function useSpecificationIncompatibleSchemaSetting() {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const updateOnIncompatibleSchemaChange = useCallback(
        async (value: AutoCompleteOption['val'] | undefined) => {
            if (!mutateDraftSpecs || !draftId || !draftSpec) {
                logRocketEvent(
                    `${CustomEvents.INCOMPATIBLE_SCHEMA_CHANGE}:Missing Draft Resources`,
                    {
                        draftIdMissing: !draftId,
                        draftSpecMissing: !draftSpec,
                        mutateMissing: !mutateDraftSpecs,
                    }
                );

                return Promise.resolve();
            }

            const spec: Schema = cloneDeep(draftSpec.spec);

            addOrRemoveOnIncompatibleSchemaChange(spec, value);

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: 'materialization',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpec, mutateDraftSpecs]
    );

    return {
        currentSetting: draftSpec?.spec?.onIncompatibleSchemaChange
            ? draftSpec.spec.onIncompatibleSchemaChange
            : '',
        updateOnIncompatibleSchemaChange,
    };
}
