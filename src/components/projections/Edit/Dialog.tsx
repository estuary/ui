import type { EditProjectionDialogProps } from 'src/components/projections/Edit/types';

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
import { useStoreProjection } from 'src/hooks/projections/useStoreProjections';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

function EditProjectionDialog({
    field,
    open,
    pointer,
    setOpen,
}: EditProjectionDialogProps) {
    const intl = useIntl();

    const { storeSingleProjection } = useStoreProjection();

    const currentCollection = useBinding_currentCollection();
    const setSingleProjection = useWorkflowStore(
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

                {/* <ProjectionDefinitions field={field} pointer={pointer} /> */}
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
                            setSingleProjection(
                                {
                                    field: formattedFieldInput,
                                    location: pointer,
                                },
                                currentCollection
                            );

                            storeSingleProjection(
                                currentCollection,
                                formattedFieldInput,
                                pointer
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
