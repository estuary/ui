import type { AutoCompleteOption } from 'src/components/materialization/source/targetSchema/types';
import type { TargetSchemas } from 'src/types';

import { useCallback } from 'react';

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
        (state) => [state.targetSchema, state.setTargetSchema, state.setSaving]
    );

    const { currentSetting, updateSourceSetting } =
        useSourceSetting<TargetSchemas>('targetSchema');

    const updateServer = useCallback(
        async (option?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });
            setSaving(true);

            return updateSourceSetting(option?.val)
                .then(() => {
                    setTargetSchema(option?.val);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setTargetSchema(currentSetting);
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
            setTargetSchema,
            updateSourceSetting,
        ]
    );

    return (
        <TargetSchemaForm
            currentSetting={targetSchema}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
