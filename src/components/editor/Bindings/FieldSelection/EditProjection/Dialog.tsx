import type { Dispatch, SetStateAction } from 'react';
import type { Projection } from 'src/components/editor/Bindings/FieldSelection/types';

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

import FieldEditor from 'src/components/editor/Bindings/FieldSelection/EditProjection/FieldEditor';
import { useStoreProjection } from 'src/hooks/projections/useStoreProjections';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

interface Props {
    field: string;
    open: boolean;
    projection: Projection;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'field-selection-dialog-title';

function EditProjectionDialog({ field, open, setOpen, projection }: Props) {
    const intl = useIntl();

    const { storeSingleProjection } = useStoreProjection();

    // Binding Store
    const currentCollection = useBinding_currentCollection();

    const setSingleProjection = useWorkflowStore(
        (state) => state.setSingleProjection
    );

    const [fieldInput, setFieldInput] = useState('');

    return (
        <Dialog open={open} maxWidth="lg" aria-labelledby={TITLE_ID}>
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
                            projection.ptr &&
                            currentCollection
                        ) {
                            setSingleProjection(
                                {
                                    field: formattedFieldInput,
                                    location: projection.ptr,
                                },
                                currentCollection
                            );

                            storeSingleProjection(
                                currentCollection,
                                formattedFieldInput,
                                projection.ptr
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
