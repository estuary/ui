import { Box, Typography } from '@mui/material';
import { useBindingsEditorStore_documentsRead } from 'components/editor/Bindings/Store/hooks';
import { defaultOutline, monacoEditorWidgetBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

function InferenceDiffEditorFooter() {
    // Bindings Editor Store
    const documentsRead = useBindingsEditorStore_documentsRead();

    return (
        <Box
            sx={{
                p: 1,
                backgroundColor: (theme) =>
                    monacoEditorWidgetBackground[theme.palette.mode],
                borderTop: (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            <Typography variant="caption">
                <FormattedMessage
                    id="workflows.collectionSelector.schemaInference.message.documentsRead"
                    values={{
                        documents_read: documentsRead ?? 0,
                    }}
                />
            </Typography>
        </Box>
    );
}

export default InferenceDiffEditorFooter;
