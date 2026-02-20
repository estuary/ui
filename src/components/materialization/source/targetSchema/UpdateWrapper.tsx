import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { TargetSchemas } from 'src/stores/SourceCapture/types';

import { useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import TargetSchemaForm from 'src/components/materialization/source/targetSchema/Form';
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

export default function TargetSchemaUpdateWrapper() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [targetSchema, setTargetSchema, setSaving] = useSourceCaptureStore(
        useShallow((state) => [state.targetSchema, state.setTargetSchema, state.setSaving])
    );

    const { currentSetting, updateSourceSetting } =
        useSourceSetting<TargetSchemas>('targetNaming');

    const updateServer = useCallback(
        async (option?: AutoCompleteOptionForTargetSchema | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            return updateSourceSetting(option?.val)
                .then(() => {
                    setTargetSchema(option ? option.val : undefined);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch((error) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setTargetSchema(currentSetting);
                    setFormState({ status: FormStatus.FAILED });

                    return Promise.reject(error);
                })
                .finally(() => setSaving(false));
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
            setFormState,
            setSaving,
            setTargetSchema,
            updateSourceSetting,
        ]
    );

    return (
        <TargetSchemaForm
            currentSetting={currentSetting ?? targetSchema}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
