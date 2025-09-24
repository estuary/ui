import { useCallback } from 'react';

import { Box } from '@mui/material';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import AlgorithmMenu from 'src/components/fieldSelection/FieldActions/AlgorithmMenu';
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

const FieldsRecommendedUpdateWrapper = () => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [setFieldsRecommended, setSaving, saving] = useSourceCaptureStore(
        (state) => [state.setFieldsRecommended, state.setSaving, state.saving]
    );

    const { currentSetting, updateSourceSetting } = useSourceSetting<
        boolean | number
    >('fieldsRecommended');

    const updateServer = useCallback(
        async (value: number | boolean) => {
            setSaving(true);
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateSourceSetting(value)
                .then(() => {
                    setFieldsRecommended(value);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setFieldsRecommended(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                })
                .finally(() => setSaving(false));
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
            setFieldsRecommended,
            setFormState,
            setSaving,
            updateSourceSetting,
        ]
    );

    return (
        <Box>
            <AlgorithmMenu
                handleClick={(recommended) => updateServer(recommended)}
                disabled={saving}
                targetFieldsRecommended
            />
        </Box>
    );
};

export default FieldsRecommendedUpdateWrapper;
