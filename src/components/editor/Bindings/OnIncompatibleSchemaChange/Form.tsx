import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'components/editor/Store/hooks';
import IncompatibleSchemaChangeForm from 'components/incompatibleSchemaChange/Form';
import { AutoCompleteOption } from 'components/incompatibleSchemaChange/types';
import useUpdateOnIncompatibleSchemaChange from 'hooks/OnIncompatibleSchemaChange/useUpdateOnIncompatibleSchemaChange';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { BindingMetadata } from 'types';
import { snackbarSettings } from 'utils/notification-utils';

interface Props {
    bindingIndex: number;
}

function BindingIncompatibleSchemaChangeForm({ bindingIndex = -1 }: Props) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    const setFormState = useFormStateStore_setFormState();

    const currentSetting = useEditorStore_queryResponse_draftSpecs_schemaProp(
        bindingIndex,
        'onIncompatibleSchemaChange'
    );

    const { updateOnIncompatibleSchemaChange } =
        useUpdateOnIncompatibleSchemaChange();

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

                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            bindingMetadata,
            enqueueSnackbar,
            intl,
            setFormState,
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

export default BindingIncompatibleSchemaChangeForm;
