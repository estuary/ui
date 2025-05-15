import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import DeltaUpdatesForm from 'src/components/materialization/source/deltaUpdates/Form';
import useSourceSetting from 'src/hooks/sourceCapture/useSourceSetting';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

export default function DeltaUpdatesUpdateWrapper() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setFormState = useFormStateStore_setFormState();

    const [setDeltaUpdates] = useSourceCaptureStore((state) => [
        state.setDeltaUpdates,
    ]);

    const { currentSetting, updateSourceSetting } =
        useSourceSetting<boolean>('deltaUpdates');

    const updateServer = useCallback(
        async (option?: boolean) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateSourceSetting(option)
                .then(() => {
                    setDeltaUpdates(Boolean(option));

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setDeltaUpdates(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
            setDeltaUpdates,
            setFormState,
            updateSourceSetting,
        ]
    );

    return (
        <DeltaUpdatesForm
            currentSetting={currentSetting}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
