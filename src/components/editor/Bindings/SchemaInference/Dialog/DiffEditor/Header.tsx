import {
    Box,
    CircularProgress,
    Stack,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
} from '@mui/material';
import { useBindingsEditorStore_loadingInferredSchema } from 'components/editor/Bindings/Store/hooks';
import { defaultOutline, monacoEditorHeaderBackground } from 'context/Theme';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 400,
    },
    [`& .${tooltipClasses.popper}`]: {
        overflowWrap: 'break-word',
    },
});

function InferenceDiffEditorHeader() {
    // Bindings Editor Store
    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    return currentCollection ? (
        <Box
            sx={{
                p: 1,
                height: 54,
                backgroundColor: (theme) =>
                    monacoEditorHeaderBackground[theme.palette.mode],
                borderBottom: (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            <Stack
                direction="row"
                sx={{
                    height: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
        </Box>
    ) : null;
}

export default InferenceDiffEditorHeader;
