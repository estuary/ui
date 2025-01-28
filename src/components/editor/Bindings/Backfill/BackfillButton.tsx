import { Box, Stack, Typography } from '@mui/material';
import BooleanToggleButton from 'components/shared/buttons/BooleanToggleButton';
import { BooleanString } from 'components/shared/buttons/types';
import { useEntityWorkflow } from 'context/Workflow';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_allBindingsDisabled,
    useBinding_backfillAllBindings,
    useBinding_backfilledBindings,
    useBinding_backfillSupported,
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
    useBinding_enabledCollections_count,
    useBinding_setBackfilledBindings,
} from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useTenantStore } from 'stores/Tenant/Store';
import { BindingMetadata } from 'types';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore_queryResponse_draftSpecs } from '../../Store/hooks';
import BackfillCount from './BackfillCount';
import BackfillDataFlowOption from './BackfillDataFlowOption';
import BackfillNotSupportedAlert from './BackfillNotSupportedAlert';
import EvolvedAlert from './EvolvedAlert';
import EvolvedCount from './EvolvedCount';
import { BackfillButtonProps } from './types';
import useUpdateBackfillCounter from './useUpdateBackfillCounter';

function BackfillButton({
    description,
    bindingIndex = -1,
}: BackfillButtonProps) {
    const intl = useIntl();
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    const workflow = useEntityWorkflow();

    const evolvedCollections = useBindingStore(
        (state) => state.evolvedCollections
    );

    // Binding Store
    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();
    const collectionsCount = useBinding_enabledCollections_count();
    const allBindingsDisabled = useBinding_allBindingsDisabled();

    const backfillAllBindings = useBinding_backfillAllBindings();
    const backfilledBindings = useBinding_backfilledBindings();
    const setBackfilledBindings = useBinding_setBackfilledBindings();
    const backfillSupported = useBinding_backfillSupported();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Tenant Store
    const trialOnlyPrefixes = useTenantStore(
        useShallow((state) => state.trialStorageOnly)
    );

    const disabled =
        formActive ||
        collectionsCount < 1 ||
        allBindingsDisabled ||
        !backfillSupported;

    const reversioned = useMemo(() => {
        if (bindingIndex === -1) {
            return false;
        }

        return evolvedCollections.some(
            (evolvedCollection) =>
                evolvedCollection.new_name === currentCollection
        );
    }, [bindingIndex, currentCollection, evolvedCollections]);

    const selected = useMemo(() => {
        if (bindingIndex === -1) {
            return backfillAllBindings;
        }

        return currentBindingUUID
            ? backfilledBindings.includes(currentBindingUUID)
            : false;
    }, [
        backfillAllBindings,
        backfilledBindings,
        bindingIndex,
        currentBindingUUID,
    ]);

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const evaluateServerDifferences = useCallback(
        (increment: BooleanString) => {
            if (bindingIndex === -1) {
                return (
                    (backfillAllBindings && increment === 'false') ||
                    (!backfillAllBindings && increment === 'true')
                );
            }

            if (currentBindingUUID) {
                return increment === 'true'
                    ? !backfilledBindings.includes(currentBindingUUID)
                    : backfilledBindings.includes(currentBindingUUID);
            }

            return false;
        },
        [
            backfillAllBindings,
            backfilledBindings,
            bindingIndex,
            currentBindingUUID,
        ]
    );

    const handleClick = useCallback(
        (increment: BooleanString) => {
            const serverUpdateRequired = evaluateServerDifferences(increment);

            if (draftSpec && serverUpdateRequired) {
                setFormState({ status: FormStatus.UPDATING, error: null });

                const singleBindingUpdate =
                    bindingIndex > -1 &&
                    currentCollection &&
                    currentBindingUUID;

                const bindingMetadata: BindingMetadata[] = singleBindingUpdate
                    ? [{ collection: currentCollection, bindingIndex }]
                    : [];

                updateBackfillCounter(
                    draftSpec,
                    increment,
                    bindingMetadata
                ).then(
                    () => {
                        const targetBindingUUID = singleBindingUpdate
                            ? currentBindingUUID
                            : undefined;

                        setBackfilledBindings(
                            increment,
                            targetBindingUUID,
                            trialOnlyPrefixes
                        );
                        setFormState({ status: FormStatus.UPDATED });
                    },
                    (error) => {
                        setFormState({
                            status: FormStatus.FAILED,
                            error: {
                                title: 'workflows.collectionSelector.manualBackfill.error.title',
                                error,
                            },
                        });
                    }
                );
            }
        },
        [
            bindingIndex,
            currentBindingUUID,
            currentCollection,
            draftSpec,
            evaluateServerDifferences,
            setBackfilledBindings,
            setFormState,
            trialOnlyPrefixes,
            updateBackfillCounter,
        ]
    );

    // Do not want to overload the user with "this is not supported" so only showing message on the "backfill all" toggle.
    if (!backfillSupported && bindingIndex !== -1) {
        return null;
    }

    return (
        <Box>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography component="div">{description}</Typography>

                {!backfillSupported ? <BackfillNotSupportedAlert /> : null}
            </Stack>

            <Stack direction="row" spacing={2}>
                <BooleanToggleButton
                    size={bindingIndex === -1 ? 'large' : undefined}
                    selected={Boolean(selected || reversioned)}
                    disabled={disabled || reversioned}
                    onClick={(event, checked: string) => {
                        event.preventDefault();
                        event.stopPropagation();

                        handleClick(checked === 'true' ? 'false' : 'true');
                    }}
                >
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.manualBackfill.cta.backfill',
                    })}
                </BooleanToggleButton>

                {backfillSupported && bindingIndex === -1 ? (
                    <>
                        <BackfillCount disabled={disabled} />
                        <EvolvedCount />
                    </>
                ) : null}

                {reversioned && bindingIndex !== -1 ? <EvolvedAlert /> : null}
            </Stack>

            {bindingIndex === -1 && workflow === 'capture_edit' ? (
                <BackfillDataFlowOption />
            ) : null}
        </Box>
    );
}

export default BackfillButton;
