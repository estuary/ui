import { Box, Stack, Typography } from '@mui/material';
import BooleanToggleButton from 'components/shared/buttons/BooleanToggleButton';
import { BooleanString } from 'components/shared/buttons/types';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_allBindingsDisabled,
    useBinding_backfillAllBindings,
    useBinding_backfilledBindings,
    useBinding_currentCollection,
    useBinding_currentBindingUUID,
    useBinding_setBackfilledBindings,
    useBinding_collections_count,
} from 'stores/Binding/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useEditorStore_queryResponse_draftSpecs } from '../../Store/hooks';
import BackfillCount from './BackfillCount';
import { BackfillProps } from './types';
import useUpdateBackfillCounter, {
    BindingMetadata,
} from './useUpdateBackfillCounter';

function Backfill({ description, bindingIndex = -1 }: BackfillProps) {
    const intl = useIntl();
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    // TODO (data flow reset)
    // const workflow = useEntityWorkflow();

    // Binding Store
    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();
    const collectionsCount = useBinding_collections_count();
    const allBindingsDisabled = useBinding_allBindingsDisabled();

    const backfillAllBindings = useBinding_backfillAllBindings();
    const backfilledBindings = useBinding_backfilledBindings();
    const setBackfilledBindings = useBinding_setBackfilledBindings();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

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

                        setBackfilledBindings(increment, targetBindingUUID);
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
            updateBackfillCounter,
        ]
    );

    const disabled = formActive || collectionsCount < 1 || allBindingsDisabled;

    return (
        <Box sx={{ mt: 3 }}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography
                    variant={bindingIndex === -1 ? 'formSectionHeader' : 'h6'}
                >
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.manualBackfill.header',
                    })}
                </Typography>

                <Typography component="div">{description}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
                <BooleanToggleButton
                    size={bindingIndex === -1 ? 'large' : undefined}
                    selected={selected}
                    disabled={disabled}
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

                {bindingIndex === -1 ? (
                    <BackfillCount disabled={disabled} />
                ) : null}
            </Stack>

            {/*TODO (data flow reset)*/}
            {/*            {bindingIndex === -1 && workflow === 'capture_edit' ? (
                <BackfillDataFlowOption />
            ) : null}*/}
        </Box>
    );
}

export default Backfill;
