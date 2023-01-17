import { DataObject } from '@mui/icons-material';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import LowDocumentCountAlert from 'components/editor/Bindings/SchemaInference/Dialog/Alerts/LowDocumentCount';
import SchemaApplicationErroredAlert from 'components/editor/Bindings/SchemaInference/Dialog/Alerts/SchemaApplicationErrored';
import CancelButton from 'components/editor/Bindings/SchemaInference/Dialog/CancelButton';
import InferenceDiffEditor from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaInference/Dialog/UpdateSchemaButton';
import { CollectionData } from 'components/editor/Bindings/types';
import { glassBkgWithoutBlur } from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    collectionData: CollectionData;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const TITLE_ID = 'inferred-schema-dialog-title';

function SchemaInferenceDialog({
    collectionData,
    open,
    setOpen,
    height,
}: Props) {
    const theme = useTheme();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    return currentCollection ? (
        <Dialog
            open={open}
            maxWidth="lg"
            aria-labelledby={TITLE_ID}
            sx={{
                '& .MuiPaper-root.MuiDialog-paper': {
                    backgroundColor: glassBkgWithoutBlur[theme.palette.mode],
                    borderRadius: 5,
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <DataObject />

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

                <InferenceDiffEditor
                    collectionData={collectionData}
                    height={height}
                />
            </DialogContent>

            <DialogActions>
                <CancelButton setOpen={setOpen} />

                <UpdateSchemaButton
                    collectionData={collectionData}
                    setOpen={setOpen}
                />
            </DialogActions>
        </Dialog>
    ) : null;
}

export default SchemaInferenceDialog;
