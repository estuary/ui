import type { AutoCompleteOption } from 'src/components/materialization/source/targetSchema/types';

import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import TargetSchemaForm from 'src/components/materialization/source/targetSchema/Form';
import useTargetSchemaSetting from 'src/hooks/sourceCapture/useTargetSchemaSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

export default function TargetSchemaUpdateWrapper() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [setTargetSchema] = useSourceCaptureStore((state) => [
        state.setTargetSchema,
    ]);

    const { currentSetting, updateTargetSchemaSetting } =
        useTargetSchemaSetting();

    const updateServer = useCallback(
        async (option?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateTargetSchemaSetting(option?.val)
                .then(() => {
                    setTargetSchema(option?.val);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'incompatibleSchemaChange.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setTargetSchema(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
            setFormState,
            setTargetSchema,
            updateTargetSchemaSetting,
        ]
    );

    return (
        <TargetSchemaForm
            currentSetting={currentSetting}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
