import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import invariableStores from 'context/Zustand/invariableStores';
import { useCallback } from 'react';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

import { Schema } from 'types';
import { useStore } from 'zustand';

function useSourceCapture() {
    const setFormState = useFormStateStore_setFormState();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const [sourceCapture, setSaving] = useStore(
        invariableStores['source-capture'],
        (state) => {
            return [state.sourceCapture, state.setSaving];
        }
    );

    const update = useCallback(async () => {
        if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
            return Promise.reject();
        } else {
            setSaving(true);

            const spec: Schema = draftSpecs[0].spec;

            if (sourceCapture) {
                spec.sourceCapture = sourceCapture;
            } else if (spec.sourceCapture) {
                delete spec.sourceCapture;
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpecs[0].catalog_name,
                spec_type: 'materialization',
            });

            if (updateResponse.error) {
                return Promise.reject();
            }

            return mutateDraftSpecs();
        }
    }, [draftId, draftSpecs, mutateDraftSpecs, setSaving, sourceCapture]);

    return useCallback(async () => {
        update()
            .then(
                () => setFormState({ status: FormStatus.UPDATED }),
                (error) => setFormState({ status: FormStatus.FAILED, error })
            )
            .finally(() => setSaving(false));
    }, [setFormState, setSaving, update]);
}

export default useSourceCapture;
