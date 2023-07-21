import { Dispatch, SetStateAction } from 'react';

import { CodeBrackets } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import LowDocumentCountAlert from 'components/editor/Bindings/SchemaInference/Dialog/Alerts/LowDocumentCount';
import SchemaApplicationErroredAlert from 'components/editor/Bindings/SchemaInference/Dialog/Alerts/SchemaApplicationErrored';
import CancelButton from 'components/editor/Bindings/SchemaInference/Dialog/CancelButton';
import InferenceDiffEditor from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaInference/Dialog/UpdateSchemaButton';

import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const TITLE_ID = 'inferred-schema-dialog-title';

function SchemaInferenceDialog({ open, setOpen, height }: Props) {
    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    return currentCollection ? (
        <Dialog open={open} maxWidth="lg" aria-labelledby={TITLE_ID}>
            <DialogTitle
                component="div"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <CodeBrackets />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.header" />
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message" />
                </Typography>

                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message.schemaDiff" />
                </Typography>

                <Stack spacing={1}>
                    <SchemaApplicationErroredAlert />

                    <LowDocumentCountAlert />
                </Stack>

                <InferenceDiffEditor height={height} />
            </DialogContent>

            <DialogActions>
                <CancelButton setOpen={setOpen} />

                <UpdateSchemaButton setOpen={setOpen} />
            </DialogActions>
        </Dialog>
    ) : null;
}

export default SchemaInferenceDialog;
