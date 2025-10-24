import { useCallback, useEffect, useMemo } from 'react';

import { Box } from '@mui/material';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import AlgorithmMenu from 'src/components/fieldSelection/FieldActions/AlgorithmMenu';
import { useEntityWorkflow } from 'src/context/Workflow';
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

const FieldsRecommendedUpdateWrapper = () => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const workflow = useEntityWorkflow();

    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    const persistedDraftId = useEditorStore_persistedDraftId();

    const setFormState = useFormStateStore_setFormState();

    const [setFieldsRecommended, fieldsRecommended, setSaving, saving] =
        useSourceCaptureStore((state) => [
            state.setFieldsRecommended,
            state.fieldsRecommended,
            state.setSaving,
            state.saving,
        ]);

    const { currentSetting, updateSourceSetting } = useSourceSetting<
        boolean | number
    >('fieldsRecommended');

    useMount(() => {
        if (workflow === 'materialization_create') {
            setFieldsRecommended(1);
            setSelectionAlgorithm('depthOne', undefined);
        }
    });

    const storeUpdateRequired = useMemo(
        () => fieldsRecommended !== currentSetting,
        [currentSetting, fieldsRecommended]
    );

    useEffect(() => {
        if (persistedDraftId && !saving && storeUpdateRequired) {
            setFieldsRecommended(currentSetting);
        }
    }, [
        currentSetting,
        persistedDraftId,
        saving,
        setFieldsRecommended,
        storeUpdateRequired,
    ]);

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
