import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useBindingsEditorStore_loadingInferredSchema } from 'components/editor/Bindings/Store/hooks';
import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';
import { defaultOutline, monacoEditorHeaderBackground } from 'context/Theme';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

function InferenceDiffEditorHeader() {
    // Bindings Editor Store
    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    return currentCollection ? (
        <Stack
            direction="row"
            sx={{
                p: 1,
                height: 54,
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: (theme) =>
                    monacoEditorHeaderBackground[theme.palette.mode],
                borderBottom: (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            <CustomWidthTooltip
                title={currentCollection}
                placement="bottom-start"
            >
                <Typography noWrap sx={{ mr: 2 }}>
                    {currentCollection}
                </Typography>
            </CustomWidthTooltip>

            {loadingInferredSchema ? (
                <Box sx={{ px: 1, pt: 1 }}>
                    <CircularProgress size="1.5rem" />
                </Box>
            ) : null}
        </Stack>
    ) : null;
}

export default InferenceDiffEditorHeader;
