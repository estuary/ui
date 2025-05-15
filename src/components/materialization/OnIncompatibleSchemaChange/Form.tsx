import type { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';

import { useCallback } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import IncompatibleSchemaChangeForm from 'src/components/incompatibleSchemaChange/Form';
import useSpecificationIncompatibleSchemaSetting from 'src/hooks/OnIncompatibleSchemaChange/useSpecificationIncompatibleSchemaSetting';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { snackbarSettings } from 'src/utils/notification-utils';

export default function Form() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const setIncompatibleSchemaChange = useBindingStore(
        (state) => state.setSpecOnIncompatibleSchemaChange
    );

    const setFormState = useFormStateStore_setFormState();

    const { currentSetting, updateOnIncompatibleSchemaChange } =
        useSpecificationIncompatibleSchemaSetting();

    const updateServer = useCallback(
        async (option?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateOnIncompatibleSchemaChange(option?.val)
                .then(() => {
                    setIncompatibleSchemaChange(option?.val);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setIncompatibleSchemaChange(currentSetting);
                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            currentSetting,
            enqueueSnackbar,
            intl,
            setFormState,
            setIncompatibleSchemaChange,
            updateOnIncompatibleSchemaChange,
        ]
    );

    return (
        <IncompatibleSchemaChangeForm
            currentSetting={currentSetting}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
