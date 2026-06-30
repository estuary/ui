import type { AutoCompleteOptionForIncompatibleSchemaChange } from 'src/components/incompatibleSchemaChange/types';

import { useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

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

    const [onIncompatibleSchemaChange, setIncompatibleSchemaChange] =
        useBindingStore(
            useShallow((state) => [
                state.onIncompatibleSchemaChange,
                state.setSpecOnIncompatibleSchemaChange,
            ])
        );

    const setFormState = useFormStateStore_setFormState();

    const { currentSetting, updateOnIncompatibleSchemaChange } =
        useSpecificationIncompatibleSchemaSetting();

    const updateServer = useCallback(
        async (
            option?: AutoCompleteOptionForIncompatibleSchemaChange['val']
        ) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            return updateOnIncompatibleSchemaChange(option)
                .then(() => {
                    setIncompatibleSchemaChange(option);

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch((error) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'specPropEditor.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setIncompatibleSchemaChange(currentSetting);
                    setFormState({ status: FormStatus.FAILED });

                    return Promise.reject(error);
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
            currentSetting={currentSetting ?? onIncompatibleSchemaChange}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
