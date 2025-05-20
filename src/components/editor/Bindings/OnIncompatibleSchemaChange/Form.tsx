import type {
    AutoCompleteOptionForIncompatibleSchemaChange,
    OnIncompatibleSchemaChangeProps,
} from 'src/components/incompatibleSchemaChange/types';
import type { BindingMetadata } from 'src/types';

import { useCallback, useMemo } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'src/components/editor/Store/hooks';
import IncompatibleSchemaChangeForm from 'src/components/incompatibleSchemaChange/Form';
import useBindingIncompatibleSchemaSetting from 'src/hooks/OnIncompatibleSchemaChange/useBindingIncompatibleSchemaSetting';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { snackbarSettings } from 'src/utils/notification-utils';

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
        async (
            value?: AutoCompleteOptionForIncompatibleSchemaChange | null
        ) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            return updateOnIncompatibleSchemaChange(value?.val, bindingMetadata)
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
                                    : 'specPropEditor.update.error',
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
