import IncompatibleSchemaChangeForm from 'components/incompatibleSchemaChange/Form';
import { AutoCompleteOption } from 'components/incompatibleSchemaChange/types';
import useSpecificationIncompatibleSchemaSetting from 'hooks/OnIncompatibleSchemaChange/useSpecificationIncompatibleSchemaSetting';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { snackbarSettings } from 'utils/notification-utils';

export default function SpecificationIncompatibleSchemaChangeForm() {
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

            setIncompatibleSchemaChange(option?.val);

            updateOnIncompatibleSchemaChange(option?.val)
                .then(() => {
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'incompatibleSchemaChange.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
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
            updateDraftedSetting={updateServer}
        />
    );
}
