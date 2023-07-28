import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import FieldEditor from 'components/editor/Bindings/FieldSelection/EditProjection/FieldEditor';
import { Projection } from 'components/editor/Bindings/FieldSelection/types';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    open: boolean;
    operation: 'addProjection' | 'renameField';
    projection: Projection;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'field-selection-dialog-title';

function EditProjectionDialog({ open, setOpen, projection, operation }: Props) {
    const currentCollection = useResourceConfig_currentCollection();

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
