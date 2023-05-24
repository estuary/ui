import {
    Box,
    Button,
    Grid,
    GridSize,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { intensifiedOutline } from 'context/Theme';
import {
    useTransformationCreate_previewActive,
    useTransformationCreate_setPreviewActive,
} from 'stores/TransformationCreate/hooks';
import { BaseComponentProps } from 'types';

interface WrapperProps extends BaseComponentProps {
    gridSize: GridSize;
    hideBorderRight?: boolean;
}

function Wrapper({ children, gridSize }: WrapperProps) {
    const theme = useTheme();

    return (
        <Grid
            item
            xs={gridSize}
            sx={{
                pt: 1.5,
                pb: 1,
                px: 1,
                borderBottom: intensifiedOutline[theme.palette.mode],
                borderTop: intensifiedOutline[theme.palette.mode],
                borderRight: intensifiedOutline[theme.palette.mode],
                borderLeft: intensifiedOutline[theme.palette.mode],
            }}
        >
            {children}
        </Grid>
    );
}

const headerStyle = { mb: 0.5, fontSize: 16, fontWeight: 500 };

function DerivationEditorHeader() {
    const previewActive = useTransformationCreate_previewActive();
    const setPreviewActive = useTransformationCreate_setPreviewActive();

    const generateDataPreview = () => {
        setPreviewActive(true);
    };

    return (
        <Grid container>
            <Wrapper gridSize={3}>
                <Typography sx={headerStyle}>Catalog</Typography>

                <Typography variant="caption">
                    This is a placeholder for a section description
                </Typography>
            </Wrapper>

            <Wrapper gridSize={5}>
                <Stack
                    spacing={1}
                    direction="row"
                    sx={{ justifyContent: 'space-between' }}
                >
                    <Box>
                        <Typography sx={headerStyle}>Streaming</Typography>

                        <Typography variant="caption">
                            Used for selecting columns and creating aggregations
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            disabled={previewActive}
                            onClick={generateDataPreview}
                        >
                            Preview
                        </Button>
                    </Box>
                </Stack>
            </Wrapper>

            <Wrapper gridSize={4} hideBorderRight>
                <Typography sx={headerStyle}>Data Preview</Typography>

                <Typography variant="caption">
                    This is a placeholder for a section description
                </Typography>
            </Wrapper>
        </Grid>
    );
}

export default DerivationEditorHeader;
