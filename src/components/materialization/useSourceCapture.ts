import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useCallback, useMemo } from 'react';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';

import { Schema, SourceCaptureDef } from 'types';
import { addOrRemoveSourceCapture, getSourceCapture } from 'utils/entity-utils';

function useSourceCapture() {
    const setFormState = useFormStateStore_setFormState();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const setSaving = useSourceCaptureStore((state) => state.setSaving);

    const existingSourceCapture = useMemo(() => {
        if (draftSpecs.length === 0) {
            return null;
        }

        return getSourceCapture(draftSpecs[0].spec.sourceCapture);
    }, [draftSpecs]);

    const update = useCallback(
        async (sourceCapture: SourceCaptureDef | null) => {
            if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
                return Promise.reject();
            } else {
                setFormState({ status: FormStatus.UPDATING });
                setSaving(true);

                // We had changes so let's update the spec
                const spec: Schema = addOrRemoveSourceCapture(
                    draftSpecs[0].spec,
                    sourceCapture
                );

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
        },
        [draftId, draftSpecs, mutateDraftSpecs, setFormState, setSaving]
    );

    const updateDraft = useCallback(
        async (sourceCapture: SourceCaptureDef | null) => {
            update(sourceCapture)
                .then(
                    () => setFormState({ status: FormStatus.UPDATED }),
                    (error) =>
                        setFormState({ status: FormStatus.FAILED, error })
                )
                .finally(() => setSaving(false));
        },
        [setFormState, setSaving, update]
    );

    return {
        existingSourceCapture,
        updateDraft,
    };
}

export default useSourceCapture;
