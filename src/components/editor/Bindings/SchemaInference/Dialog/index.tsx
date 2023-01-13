import { DataObject } from '@mui/icons-material';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    useTheme,
} from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import InferenceDiffEditor from 'components/editor/Bindings/SchemaInference/Dialog/DiffEditor';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaInference/Dialog/UpdateSchemaButton';
import { useBindingsEditorStore_documentsRead } from 'components/editor/Bindings/Store/hooks';
import { CollectionData } from 'components/editor/Bindings/types';
import AlertBox from 'components/shared/AlertBox';
import {
    glassBkgWithoutBlur,
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    collectionData: CollectionData;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const TITLE_ID = 'inferred-schema-dialog-title';

const DOCUMENT_THRESHOLD = 10000;

function SchemaInferenceDialog({
    collectionData,
    open,
    setOpen,
    height,
}: Props) {
    const theme = useTheme();

    // Bindings Editor Store
    const documentsRead = useBindingsEditorStore_documentsRead();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const [schemaUpdateErrored] = useState<boolean>(false);

    const handlers = {
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
    };

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

                <Typography sx={{ mb: 4 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message.schemaDiff" />
                </Typography>

                {schemaUpdateErrored ? (
                    <AlertBox
                        severity="error"
                        short
                        title={
                            <Typography>
                                <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.generalError.header" />
                            </Typography>
                        }
                    >
                        <MessageWithLink messageID="workflows.collectionSelector.schemaInference.alert.patchService.message" />
                    </AlertBox>
                ) : null}

                {documentsRead && documentsRead < DOCUMENT_THRESHOLD ? (
                    <AlertBox
                        severity="warning"
                        short
                        title={
                            <Typography>
                                <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.header" />
                            </Typography>
                        }
                    >
                        <FormattedMessage id="workflows.collectionSelector.schemaInference.alert.lowDocumentCount.message" />
                    </AlertBox>
                ) : null}

                <InferenceDiffEditor
                    collectionData={collectionData}
                    height={height}
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handlers.closeConfirmationDialog}
                    sx={{
                        'backgroundColor':
                            secondaryButtonBackground[theme.palette.mode],
                        '&:hover': {
                            backgroundColor:
                                secondaryButtonHoverBackground[
                                    theme.palette.mode
                                ],
                        },
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <UpdateSchemaButton
                    collectionData={collectionData}
                    setOpen={setOpen}
                />
            </DialogActions>
        </Dialog>
    ) : null;
}

export default SchemaInferenceDialog;
