import type {
    AutoCompleteOption,
    OnIncompatibleSchemaChangeProps,
} from 'components/incompatibleSchemaChange/types';
import type { BindingMetadata } from 'types';
import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'components/editor/Store/hooks';
import IncompatibleSchemaChangeForm from 'components/incompatibleSchemaChange/Form';
import useBindingIncompatibleSchemaSetting from 'hooks/OnIncompatibleSchemaChange/useBindingIncompatibleSchemaSetting';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { snackbarSettings } from 'utils/notification-utils';

function Form({ bindingIndex = -1 }: OnIncompatibleSchemaChangeProps) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    const setIncompatibleSchemaChange = useBindingStore(
        (state) => state.setBindingOnIncompatibleSchemaChange
    );

    const setFormState = useFormStateStore_setFormState();

    const currentSetting = useEditorStore_queryResponse_draftSpecs_schemaProp(
        bindingIndex,
        'onIncompatibleSchemaChange'
    );

    const { updateOnIncompatibleSchemaChange } =
        useBindingIncompatibleSchemaSetting();

    const bindingMetadata = useMemo<BindingMetadata[]>(() => {
        if (bindingIndex > -1 && currentCollection && currentBindingUUID) {
            return [{ collection: currentCollection, bindingIndex }];
        }

        return [];
    }, [bindingIndex, currentBindingUUID, currentCollection]);

    const updateServer = useCallback(
        async (value?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateOnIncompatibleSchemaChange(value?.val, bindingMetadata)
                .then(() => {
                    if (currentBindingUUID) {
                        setIncompatibleSchemaChange(
                            value?.val,
                            currentBindingUUID
                        );
                    }

                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch((err) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id:
                                err === 'no binding'
                                    ? 'updateBinding.error.noBinding'
                                    : 'incompatibleSchemaChange.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setIncompatibleSchemaChange(
                        currentSetting,
                        currentBindingUUID
                    );
                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            bindingMetadata,
            currentBindingUUID,
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
            currentSetting={currentSetting ? currentSetting : ''}
            scope="binding"
            updateDraftedSetting={updateServer}
        />
    );
}

export default Form;
