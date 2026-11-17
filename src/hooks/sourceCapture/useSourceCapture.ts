import { useCallback } from 'react';

import { useSnackbar } from 'notistack';

import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

function useSourceCapture() {
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const setSourceCapture = useSourceCaptureStore(
        (state) => state.setSourceCapture
    );

    const { currentSetting, updateSourceSetting } =
        useSourceSetting<string>('capture');

    const setSaving = useSourceCaptureStore((state) => state.setSaving);

    const updateDraft = useCallback(
        async (option?: string) => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            updateSourceSetting(option)
                .then(() => {
                    setSourceCapture(option);
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar('Changes to draft not saved.', {
                        ...snackbarSettings,
                        variant: 'error',
                    });
                    setSourceCapture(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                })
                .finally(() => setSaving(false));
        },
        [
            currentSetting,
            enqueueSnackbar,
            setFormState,
            setSaving,
            setSourceCapture,
            updateSourceSetting,
        ]
    );

    return {
        existingSourceCapture: currentSetting,
        updateDraft,
    };
}

export default useSourceCapture;
