import { Code } from '@mui/icons-material';
import { Box, Typography, useTheme } from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { semiTransparentBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

function SchemaEditCommands() {
    const theme = useTheme();

    const persistedDraftId = useEditorStore_persistedDraftId();

    return (
        <>
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Code />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.header" />
                </Typography>
            </Box>

            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.description" />
            </Typography>

            <Typography sx={{ mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message1" />
            </Typography>

            <Box
                sx={{
                    mb: 3,
                    p: 1,
                    bgcolor: semiTransparentBackground[theme.palette.mode],
                    borderRadius: 3,
                }}
            >
                <Typography>
                    <FormattedMessage
                        id="workflows.collectionSelector.schemaEdit.command1"
                        values={{
                            draftId: persistedDraftId,
                        }}
                    />
                </Typography>

                <Typography>
                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.command2" />
                </Typography>
            </Box>

            <Typography sx={{ mb: 1 }}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.message2" />
            </Typography>

            <Box
                sx={{
                    p: 1,
                    bgcolor: semiTransparentBackground[theme.palette.mode],
                    borderRadius: 3,
                }}
            >
                <Typography>
                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.command3" />
                </Typography>
            </Box>
        </>
    );
}

export default SchemaEditCommands;
