import { Box, Stack, Typography } from '@mui/material';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { useEntityType } from 'context/EntityContext';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_addBackfilledCollection,
    useResourceConfig_backfilledCollections,
    useResourceConfig_currentCollection,
    useResourceConfig_removeBackfilledCollection,
} from 'stores/ResourceConfig/hooks';
import { useEditorStore_queryResponse_draftSpecs } from '../Store/hooks';
import useUpdateBackfillCounter from './useUpdateBackfillCounter';

export type BooleanString = 'true' | 'false';

interface Props {
    bindingIndex: number;
}

function ManualBackfill({ bindingIndex }: Props) {
    const entityType = useEntityType();
    const { updateBackfillCounter } = useUpdateBackfillCounter();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const backfilledCollections = useResourceConfig_backfilledCollections();
    const addBackfilledCollection = useResourceConfig_addBackfilledCollection();
    const removeBackfilledCollection =
        useResourceConfig_removeBackfilledCollection();

    const [increment, setIncrement] = useState<BooleanString | 'undefined'>(
        'undefined'
    );

    const selected = useMemo(
        () =>
            currentCollection
                ? backfilledCollections.includes(currentCollection)
                : false,
        [backfilledCollections, currentCollection]
    );

    const serverUpdateRequired = useMemo(() => {
        if (currentCollection && increment !== 'undefined') {
            return increment === 'true'
                ? !backfilledCollections.includes(currentCollection)
                : backfilledCollections.includes(currentCollection);
        }

        return false;
    }, [backfilledCollections, currentCollection, increment]);

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    // TODO (backfill): The page-level error message should identify the binding which could not be updated
    //   or an error alert should be scoped to the right pane of the binding selector and appear in the Backfill
    //   section of the erring binding.
    useEffect(() => {
        if (
            draftSpec &&
            currentCollection &&
            serverUpdateRequired &&
            increment !== 'undefined'
        ) {
            setFormState({ status: FormStatus.UPDATING });

            updateBackfillCounter(draftSpec, bindingIndex, increment).then(
                () => {
                    increment === 'true'
                        ? addBackfilledCollection(currentCollection)
                        : removeBackfilledCollection(currentCollection);

                    setFormState({ status: FormStatus.UPDATED });
                },
                (error) =>
                    setFormState({
                        status: FormStatus.FAILED,
                        error: {
                            title: 'workflows.collectionSelector.manualBackfill.failed',
                            error,
                        },
                    })
            );
        }
    }, [
        addBackfilledCollection,
        bindingIndex,
        currentCollection,
        draftSpec,
        increment,
        removeBackfilledCollection,
        serverUpdateRequired,
        setFormState,
        updateBackfillCounter,
    ]);

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="h6" sx={{ mr: 0.5 }}>
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
                value={increment}
                selected={selected}
                disabled={formActive}
                onClick={(event, checked: string) => {
                    event.preventDefault();
                    event.stopPropagation();

                    setIncrement(checked === 'true' ? 'false' : 'true');
                }}
            >
                <FormattedMessage id="workflows.collectionSelector.manualBackfill.cta.backfill" />
            </OutlinedToggleButton>
        </Box>
    );
}

export default ManualBackfill;
