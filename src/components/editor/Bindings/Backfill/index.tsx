import { Box, Stack, Typography } from '@mui/material';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { useEntityType } from 'context/EntityContext';
import { Check } from 'iconoir-react';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_addBackfilledCollections,
    useResourceConfig_backfilledCollections,
    useResourceConfig_collections,
    useResourceConfig_currentCollection,
    useResourceConfig_getBackfillAllBindings,
    useResourceConfig_removeBackfilledCollections,
    useResourceConfig_setBackfillAllBindings,
} from 'stores/ResourceConfig/hooks';
import { useEditorStore_queryResponse_draftSpecs } from '../../Store/hooks';
import useUpdateBackfillCounter, {
    BindingMetadata,
} from './useUpdateBackfillCounter';

export type BooleanString = 'true' | 'false';

interface Props {
    bindingIndex?: number;
}

function Backfill({ bindingIndex = -1 }: Props) {
    const entityType = useEntityType();
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const collections = useResourceConfig_collections();

    const backfilledCollections = useResourceConfig_backfilledCollections();
    const addBackfilledCollections =
        useResourceConfig_addBackfilledCollections();
    const removeBackfilledCollections =
        useResourceConfig_removeBackfilledCollections();

    const backfillAllBindings = useResourceConfig_getBackfillAllBindings();
    const setBackfillAllBindings = useResourceConfig_setBackfillAllBindings();

    const selected = useMemo(() => {
        if (bindingIndex === -1) {
            return backfillAllBindings;
        }

        return currentCollection
            ? backfilledCollections.includes(currentCollection)
            : false;
    }, [
        backfillAllBindings,
        backfilledCollections,
        bindingIndex,
        currentCollection,
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

            if (currentCollection) {
                return increment === 'true'
                    ? !backfilledCollections.includes(currentCollection)
                    : backfilledCollections.includes(currentCollection);
            }

            return false;
        },
        [
            backfillAllBindings,
            backfilledCollections,
            bindingIndex,
            currentCollection,
        ]
    );

    const handleClick = useCallback(
        (increment: BooleanString) => {
            const serverUpdateRequired = evaluateServerDifferences(increment);

            if (draftSpec && serverUpdateRequired) {
                setFormState({ status: FormStatus.UPDATING });

                const singleBindingUpdate =
                    bindingIndex > -1 && currentCollection;

                const bindingMetadata: BindingMetadata | undefined =
                    singleBindingUpdate
                        ? { collection: currentCollection, bindingIndex }
                        : undefined;

                updateBackfillCounter(
                    draftSpec,
                    increment,
                    bindingMetadata
                ).then(
                    () => {
                        if (singleBindingUpdate) {
                            console.log('A');

                            increment === 'true'
                                ? addBackfilledCollections([currentCollection])
                                : removeBackfilledCollections([
                                      currentCollection,
                                  ]);
                        } else if (bindingIndex === -1 && collections) {
                            console.log('B');

                            increment === 'true'
                                ? addBackfilledCollections(collections)
                                : removeBackfilledCollections(collections);
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
            addBackfilledCollections,
            bindingIndex,
            collections,
            currentCollection,
            draftSpec,
            evaluateServerDifferences,
            removeBackfilledCollections,
            setBackfillAllBindings,
            setFormState,
            updateBackfillCounter,
        ]
    );

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Stack spacing={1}>
                    <Typography
                        variant={
                            bindingIndex === -1 ? 'formSectionHeader' : 'h6'
                        }
                        sx={{ mr: 0.5 }}
                    >
                        <FormattedMessage id="workflows.collectionSelector.manualBackfill.header" />
                    </Typography>

                    <Typography component="div">
                        <FormattedMessage
                            id={`workflows.collectionSelector.manualBackfill.message.${entityType}`}
                        />
                    </Typography>
                </Stack>
            </Stack>

            <OutlinedToggleButton
                value={value}
                selected={selected}
                disabled={formActive}
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
