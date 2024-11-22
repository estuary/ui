import { modifyDraftSpec } from 'api/draftSpecs';
import { AutoCompleteOption } from 'components/editor/Bindings/OnIncompatibleSchemaChange/types';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { omit } from 'lodash';
import { useCallback, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

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
            const originalSetting = draftSpec.spec?.onIncompatibleSchemaChange;

            if (!hasLength(value)) {
                spec = omit(spec, 'onIncompatibleSchemaChange');
            } else {
                spec.onIncompatibleSchemaChange = value;
            }

            if (originalSetting === spec.onIncompatibleSchemaChange) {
                return Promise.resolve();
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
        currentSetting: draftSpec?.spec?.onIncompatibleSchemaChange,
        updateOnIncompatibleSchemaChange,
    };
}
