import type { PostgrestError } from '@supabase/postgrest-js';
import type { BaseProjectionDialogProps } from 'src/components/projections/Edit/types';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import FieldEditor from 'src/components/projections/Edit/FieldEditor';
import { TITLE_ID } from 'src/components/projections/Edit/shared';
import Error from 'src/components/shared/Error';
import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

function EditProjectionDialog({
    field,
    open,
    pointer,
    setOpen,
}: BaseProjectionDialogProps) {
    const intl = useIntl();

    const { setSingleProjection } = useUpdateDraftedProjection();

    const currentCollection = useBinding_currentCollection();
    const setSingleStoredProjection = useWorkflowStore(
        (state) => state.setSingleProjection
    );

    const [fieldInput, setFieldInput] = useState('');
    const [fieldInputInvalid, setFieldInputInvalid] = useState(false);

    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    return (
        <Dialog
            aria-labelledby={TITLE_ID}
            maxWidth="md"
            open={open}
            style={{ minWidth: 500 }}
        >
            <DialogTitle>
                {intl.formatMessage({
                    id: 'projection.dialog.add.header',
                })}
            </DialogTitle>

            <DialogContent>
                {serverError ? (
                    <Box style={{ marginBottom: 16 }}>
                        <Error condensed error={serverError} severity="error" />
                    </Box>
                ) : null}

                <Typography sx={{ mb: 3 }}>
                    {intl.formatMessage(
                        {
                            id: 'projection.dialog.add.message',
                        },
                        {
                            collection: (
                                <span style={{ fontWeight: 500 }}>
                                    {currentCollection}
                                </span>
                            ),
                        }
                    )}
                </Typography>

                <FieldEditor
                    disabled={saving}
                    input={fieldInput}
                    inputInvalid={fieldInputInvalid}
                    setInput={setFieldInput}
                    setInputInvalid={setFieldInputInvalid}
                    value={field}
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        setFieldInput('');
                        setServerError(null);
                        setOpen(false);
                    }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <Button
                    disabled={
                        fieldInput.trim().length === 0 ||
                        fieldInputInvalid ||
                        saving
                    }
                    onClick={() => {
                        setSaving(true);
                        setServerError(null);

                        const formattedFieldInput = fieldInput.trim();

                        if (
                            formattedFieldInput.length === 0 ||
                            !pointer ||
                            !currentCollection
                        ) {
                            logRocketEvent(CustomEvents.PROJECTION, {
                                error: true,
                                operation: 'set',
                            });
                            logRocketConsole(
                                `${CustomEvents.PROJECTION}:add:not_attempted`,
                                {
                                    collectionMissing: !currentCollection,
                                    inputMissing:
                                        formattedFieldInput.length === 0,
                                    pointerMissing: !pointer,
                                }
                            );

                            return;
                        }

                        const metadata: ProjectionMetadata = {
                            field: formattedFieldInput,
                            location: pointer,
                        };

                        setSingleProjection(
                            currentCollection,
                            formattedFieldInput,
                            pointer
                        ).then(
                            () => {
                                setSingleStoredProjection(
                                    metadata,
                                    currentCollection
                                );

                                logRocketEvent(CustomEvents.PROJECTION, {
                                    collection: currentCollection,
                                    operation: 'set',
                                });
                                logRocketConsole(
                                    `${CustomEvents.PROJECTION}:add:success`,
                                    { metadata }
                                );

                                setSaving(false);
                                setFieldInput('');
                                setOpen(false);
                            },
                            (error) => {
                                logRocketEvent(CustomEvents.PROJECTION, {
                                    collection: currentCollection,
                                    error: true,
                                    operation: 'set',
                                });
                                logRocketConsole(
                                    `${CustomEvents.PROJECTION}:add:failed`,
                                    {
                                        error,
                                        metadata,
                                    }
                                );

                                setSaving(false);
                                setServerError(error);
                            }
                        );
                    }}
                    variant="outlined"
                >
                    {intl.formatMessage({
                        id: 'cta.evolve',
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditProjectionDialog;
