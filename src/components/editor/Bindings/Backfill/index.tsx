import { Box, Stack, Typography } from '@mui/material';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { Check } from 'iconoir-react';
import { ReactNode, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_currentBinding } from 'stores/Binding/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_allBindingsDisabled,
    useResourceConfig_backfillAllBindings,
    useResourceConfig_backfilledCollections,
    useResourceConfig_collections,
    useResourceConfig_setBackfilledCollections,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';
import { useEditorStore_queryResponse_draftSpecs } from '../../Store/hooks';
import useUpdateBackfillCounter, {
    BindingMetadata,
} from './useUpdateBackfillCounter';

export type BooleanString = 'true' | 'false';

interface Props {
    description: ReactNode;
    bindingIndex?: number;
}

function Backfill({ description, bindingIndex = -1 }: Props) {
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    // Binding Store
    const currentBinding = useBinding_currentBinding();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const backfilledCollections = useResourceConfig_backfilledCollections();
    const setBackfilledCollections =
        useResourceConfig_setBackfilledCollections();

    const backfillAllBindings = useResourceConfig_backfillAllBindings();
    const allBindingsDisabled = useResourceConfig_allBindingsDisabled();

    const selected = useMemo(() => {
        if (bindingIndex === -1) {
            return backfillAllBindings;
        }

        return currentBinding?.id
            ? backfilledCollections.includes(currentBinding.id)
            : false;
    }, [
        backfillAllBindings,
        backfilledCollections,
        bindingIndex,
        currentBinding?.id,
    ]);

    const value: BooleanString = useMemo(
        () => (selected ? 'true' : 'false'),
        [selected]
    );

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

            if (currentBinding?.id) {
                return increment === 'true'
                    ? !backfilledCollections.includes(currentBinding.id)
                    : backfilledCollections.includes(currentBinding.id);
            }

            return false;
        },
        [
            backfillAllBindings,
            backfilledCollections,
            bindingIndex,
            currentBinding?.id,
        ]
    );

    const handleClick = useCallback(
        (increment: BooleanString) => {
            const serverUpdateRequired = evaluateServerDifferences(increment);

            if (draftSpec && serverUpdateRequired) {
                setFormState({ status: FormStatus.UPDATING, error: null });

                const singleBindingUpdate = bindingIndex > -1 && currentBinding;

                const bindingMetadata: BindingMetadata[] = singleBindingUpdate
                    ? [{ collection: currentBinding.collection, bindingIndex }]
                    : [];

                updateBackfillCounter(
                    draftSpec,
                    increment,
                    bindingMetadata
                ).then(
                    () => {
                        const targetCollection = singleBindingUpdate
                            ? currentBinding.id
                            : undefined;

                        setBackfilledCollections(increment, targetCollection);
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
            currentBinding,
            draftSpec,
            evaluateServerDifferences,
            setBackfilledCollections,
            setFormState,
            updateBackfillCounter,
        ]
    );

    return (
        <Box sx={{ mt: 3 }}>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography
                    variant={bindingIndex === -1 ? 'formSectionHeader' : 'h6'}
                >
                    <FormattedMessage id="workflows.collectionSelector.manualBackfill.header" />
                </Typography>

                <Typography component="div">{description}</Typography>
            </Stack>

            <OutlinedToggleButton
                value={value}
                selected={selected}
                disabled={
                    formActive || !hasLength(collections) || allBindingsDisabled
                }
                onClick={(event, checked: string) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleClick(checked === 'true' ? 'false' : 'true');
                }}
            >
                <FormattedMessage id="workflows.collectionSelector.manualBackfill.cta.backfill" />

                {selected ? (
                    <Check style={{ marginLeft: 8, fontSize: 13 }} />
                ) : null}
            </OutlinedToggleButton>
        </Box>
    );
}

export default Backfill;
