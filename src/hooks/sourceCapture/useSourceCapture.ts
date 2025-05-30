import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

function useSourceCapture() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [setSourceCapture] = useSourceCaptureStore((state) => [
        state.setSourceCapture,
    ]);

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
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );
                    setSourceCapture(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                })
                .finally(() => setSaving(false));
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
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
