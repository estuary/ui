import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { AutoCompleteOption } from 'components/incompatibleSchemaChange/types';
import { omit } from 'lodash';
import { useCallback, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBindingStore } from 'stores/Binding/Store';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

export default function useSpecificationIncompatibleSchemaSetting() {
    // Binding Store
    const onIncompatibleSchemaChange = useBindingStore(
        (state) => state.onIncompatibleSchemaChange
    );

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
                    `${CustomEvents.INCOMPATIBLE_SCHEMA_CHANGE} : missing critical resources to update draft`,
                    {
                        draftIdMissing: !draftId,
                        draftSpecMissing: !draftSpec,
                        mutateMissing: !mutateDraftSpecs,
                    }
                );

                return Promise.resolve();
            }

            let spec: Schema = draftSpec.spec;

            if (!hasLength(value)) {
                spec = omit(spec, 'onIncompatibleSchemaChange');
            } else {
                spec.onIncompatibleSchemaChange = value;
            }

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
            : typeof onIncompatibleSchemaChange === 'string'
            ? onIncompatibleSchemaChange
            : '',
        updateOnIncompatibleSchemaChange,
    };
}
