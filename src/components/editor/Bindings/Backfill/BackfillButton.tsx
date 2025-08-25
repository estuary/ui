import type { BackfillButtonProps } from 'src/components/editor/Bindings/Backfill/types';
import type { BooleanString } from 'src/components/shared/buttons/types';
import type { BindingMetadata } from 'src/types';

import { useCallback, useMemo } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import BackfillCount from 'src/components/editor/Bindings/Backfill/BackfillCount';
import BackfillNotSupportedAlert from 'src/components/editor/Bindings/Backfill/BackfillNotSupportedAlert';
import EvolvedAlert from 'src/components/editor/Bindings/Backfill/EvolvedAlert';
import EvolvedCount from 'src/components/editor/Bindings/Backfill/EvolvedCount';
import BackfillModeSelector from 'src/components/editor/Bindings/Backfill/ModeSelector';
import useUpdateBackfillCounter from 'src/components/editor/Bindings/Backfill/useUpdateBackfillCounter';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import BooleanToggleButton from 'src/components/shared/buttons/BooleanToggleButton';
import { useEntityWorkflow } from 'src/context/Workflow';
import useTrialCollections from 'src/hooks/trialStorage/useTrialCollections';
import {
    useBinding_allBindingsDisabled,
    useBinding_backfillAllBindings,
    useBinding_backfilledBindings,
    useBinding_backfillSupported,
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
    useBinding_enabledCollections_count,
    useBinding_setBackfilledBindings,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { hasLength } from 'src/utils/misc-utils';

function BackfillButton({
    description,
    bindingIndex = -1,
}: BackfillButtonProps) {
    const intl = useIntl();
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    const workflow = useEntityWorkflow();
    const evaluateTrialCollections = useTrialCollections();

    const [evolvedCollections] = useBindingStore((state) => [
        state.evolvedCollections,
    ]);

    // Binding Store
    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();
    const collectionsCount = useBinding_enabledCollections_count();
    const allBindingsDisabled = useBinding_allBindingsDisabled();

    const backfillAllBindings = useBinding_backfillAllBindings();
    const backfilledBindings = useBinding_backfilledBindings();
    const setBackfilledBindings = useBinding_setBackfilledBindings();
    const backfillSupported = useBinding_backfillSupported();

    const setCollectionMetadata = useBindingStore(
        (state) => state.setCollectionMetadata
    );
    const setSourceBackfillRecommended = useBindingStore(
        (state) => state.setSourceBackfillRecommended
    );
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

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
                    (changes) => {
                        const targetBindingUUID = singleBindingUpdate
                            ? currentBindingUUID
                            : undefined;

                        setBackfilledBindings(
                            'reset',
                            increment,
                            targetBindingUUID
                        );

                        if (workflow === 'materialization_edit') {
                            advanceHydrationStatus(
                                'HYDRATED',
                                targetBindingUUID,
                                undefined,
                                true
                            );

                            evaluateTrialCollections(
                                changes.counterIncremented
                            ).then(
                                (response) => {
                                    setCollectionMetadata(response, []);
                                },
                                () => {}
                            );

                            if (hasLength(changes.counterDecremented)) {
                                setSourceBackfillRecommended(
                                    changes.counterDecremented,
                                    false
                                );
                            }
                        }

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
            advanceHydrationStatus,
            bindingIndex,
            currentBindingUUID,
            currentCollection,
            draftSpec,
            evaluateServerDifferences,
            evaluateTrialCollections,
            setBackfilledBindings,
            setCollectionMetadata,
            setFormState,
            setSourceBackfillRecommended,
            updateBackfillCounter,
            workflow,
        ]
    );

    // Do not want to overload the user with "this is not supported" so only showing message on the "backfill all" toggle.
    if (!backfillSupported && bindingIndex !== -1) {
        return null;
    }

    return (
        <Box style={{ maxWidth: 700 }}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography component="div">{description}</Typography>

                {!backfillSupported ? <BackfillNotSupportedAlert /> : null}
            </Stack>

            <Stack spacing={4}>
                <Stack direction="row" spacing={2}>
                    <BooleanToggleButton
                        size="small"
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

                    {reversioned && bindingIndex !== -1 ? (
                        <EvolvedAlert />
                    ) : null}
                </Stack>

                {bindingIndex === -1 && workflow === 'capture_edit' ? (
                    <Box style={{ maxWidth: 450 }}>
                        <BackfillModeSelector />
                    </Box>
                ) : null}
            </Stack>
        </Box>
    );
}

export default BackfillButton;
