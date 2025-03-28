import type { Dispatch, SetStateAction } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import FieldEditor from 'src/components/editor/Bindings/FieldSelection/EditProjection/FieldEditor';
import type { Projection } from 'src/components/editor/Bindings/FieldSelection/types';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

interface Props {
    open: boolean;
    operation: 'addProjection' | 'renameField';
    projection: Projection;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'field-selection-dialog-title';

function EditProjectionDialog({ open, setOpen, projection, operation }: Props) {
    // Binding Store
    const currentCollection = useBinding_currentCollection();

    return (
        <Dialog open={open} maxWidth="lg" aria-labelledby={TITLE_ID}>
            <DialogTitle>
                <FormattedMessage
                    id={
                        operation === 'renameField'
                            ? 'fieldSelection.dialog.updateProjection.header'
                            : 'fieldSelection.dialog.updateProjection.header.new'
                    }
                />
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage
                        id="fieldSelection.dialog.updateProjection.message"
                        values={{
                            collection: (
                                <span style={{ fontWeight: 500 }}>
                                    {currentCollection}
                                </span>
                            ),
                        }}
                    />
                </Typography>

                <Stack spacing={1}>
                    {projection.ptr ? (
                        <FieldEditor
                            disabled={operation === 'renameField'}
                            labelMessageId="fieldSelection.dialog.updateProjection.label.pointer"
                            value={projection.ptr}
                        />
                    ) : null}

                    <FieldEditor
                        disabled={operation === 'renameField'}
                        labelMessageId="fieldSelection.dialog.updateProjection.label.type"
                        value={projection.inference.types[0]}
                    />

                    <FieldEditor
                        labelMessageId="fieldSelection.dialog.updateProjection.label.fieldName"
                        value={projection.field}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button>
                    <FormattedMessage id="cta.testConfig" />
                </Button>

                <Button onClick={() => setOpen(false)}>
                    <FormattedMessage id="fieldSelection.dialog.updateProjection.cta.apply" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditProjectionDialog;
