import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import FieldsRecommendedForm from 'src/components/materialization/source/fieldsRecommended/Form';
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

const FieldsRecommendedUpdateWrapper = () => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [fieldsRecommended, setFieldsRecommended, setSaving] =
        useSourceCaptureStore((state) => [
            state.fieldsRecommended,
            state.setFieldsRecommended,
            state.setSaving,
        ]);

    const { currentSetting, updateSourceSetting } = useSourceSetting<
        boolean | number
    >('fieldsRecommended');

    const updateServer = useCallback(
        async (option?: { label: string; val: number | boolean | string }) => {
            setSaving(true);
            setFormState({ status: FormStatus.UPDATING, error: null });

            const formattedValue: number | boolean | undefined =
                typeof option?.val === 'string'
                    ? Number(option.val)
                    : option?.val;

            console.log('>>> formattedValue', formattedValue);

            updateSourceSetting(formattedValue)
                .then(() => {
                    setFieldsRecommended(formattedValue);

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
        <FieldsRecommendedForm
            currentSetting={currentSetting ?? fieldsRecommended}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
};

export default FieldsRecommendedUpdateWrapper;
