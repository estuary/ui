import type { EditProjectionDialogProps } from 'src/components/projections/Edit/types';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

import { useState } from 'react';

import {
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
import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

function EditProjectionDialog({
    field,
    open,
    pointer,
    setOpen,
}: EditProjectionDialogProps) {
    const intl = useIntl();

    const { setSingleProjection } = useUpdateDraftedProjection();

    const currentCollection = useBinding_currentCollection();
    const setSingleStoredProjection = useWorkflowStore(
        (state) => state.setSingleProjection
    );

    const [fieldInput, setFieldInput] = useState('');

    return (
        <Dialog open={open} maxWidth="md" aria-labelledby={TITLE_ID}>
            <DialogTitle>
                {intl.formatMessage({
                    id: 'fieldSelection.dialog.updateProjection.header',
                })}
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 3 }}>
                    {intl.formatMessage(
                        {
                            id: 'fieldSelection.dialog.updateProjection.message',
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
                    labelMessageId="fieldSelection.dialog.updateProjection.label.fieldName"
                    input={fieldInput}
                    setInput={setFieldInput}
                    value={field}
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        setFieldInput('');
                        setOpen(false);
                    }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <Button
                    disabled={fieldInput.trim().length === 0}
                    onClick={() => {
                        const formattedFieldInput = fieldInput.trim();

                        if (
                            formattedFieldInput.length > 0 &&
                            pointer &&
                            currentCollection
                        ) {
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
                                        metadata,
                                        operation: 'set',
                                    });
                                },
                                (error) => {
                                    logRocketEvent(CustomEvents.PROJECTION, {
                                        collection: currentCollection,
                                        error,
                                        metadata,
                                        operation: 'set',
                                    });
                                }
                            );
                        }

                        setFieldInput('');
                        setOpen(false);
                    }}
                    variant="outlined"
                >
                    {intl.formatMessage({
                        id: 'fieldSelection.dialog.updateProjection.cta.apply',
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditProjectionDialog;
