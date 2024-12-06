import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'components/editor/Store/hooks';
import IncompatibleSchemaChangeForm from 'components/incompatibleSchemaChange/Form';
import { AutoCompleteOption } from 'components/incompatibleSchemaChange/types';
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

    const incompatibleSchemaChange = useBindingStore((state) =>
        currentBindingUUID
            ? state.incompatibleSchemaChanges[currentBindingUUID]
            : undefined
    );

    const setSingleIncompatibleSchemaChange = useBindingStore(
        (state) => state.setSingleIncompatibleSchemaChange
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

            if (currentBindingUUID) {
                setSingleIncompatibleSchemaChange(
                    currentBindingUUID,
                    value?.val
                );
            }

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
            currentBindingUUID,
            enqueueSnackbar,
            intl,
            setFormState,
            setSingleIncompatibleSchemaChange,
            updateOnIncompatibleSchemaChange,
        ]
    );

    return (
        <IncompatibleSchemaChangeForm
            currentSetting={currentSetting ?? incompatibleSchemaChange}
            updateDraftedSetting={updateServer}
        />
    );
}

export default BindingIncompatibleSchemaChangeForm;
