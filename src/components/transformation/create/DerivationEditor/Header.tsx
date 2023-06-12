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
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_setPreviewActive } from 'stores/TransformationCreate/hooks';
import { BaseComponentProps } from 'types';

interface WrapperProps extends BaseComponentProps {
    gridSize: GridSize;
    minWidth?: number;
}

function Wrapper({ children, gridSize, minWidth }: WrapperProps) {
    const theme = useTheme();

    return (
        <Grid
            item
            xs={gridSize}
            sx={{
                minWidth,
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
    // const previewActive = useTransformationCreate_previewActive();
    const setPreviewActive = useTransformationCreate_setPreviewActive();

    const generateDataPreview = () => {
        setPreviewActive(true);
    };

    return (
        <Grid container wrap="nowrap">
            <Wrapper gridSize={3} minWidth={200}>
                <Typography sx={headerStyle}>
                    <FormattedMessage id="newTransform.editor.catalog.header" />
                </Typography>

                <Typography variant="caption">
                    <FormattedMessage id="newTransform.editor.catalog.description" />
                </Typography>
            </Wrapper>

            <Wrapper gridSize={5} minWidth={300}>
                <Stack
                    spacing={1}
                    direction="row"
                    sx={{ justifyContent: 'space-between' }}
                >
                    <Box>
                        <Typography sx={headerStyle}>
                            <FormattedMessage id="newTransform.editor.streaming.header" />
                        </Typography>

                        <Typography variant="caption">
                            <FormattedMessage id="newTransform.editor.streaming.description" />
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            // disabled={previewActive}
                            onClick={generateDataPreview}
                        >
                            <FormattedMessage id="newTransform.editor.streaming.cta.generatePreview" />
                        </Button>
                    </Box>
                </Stack>
            </Wrapper>

            <Wrapper gridSize={4} minWidth={300}>
                <Typography sx={headerStyle}>
                    <FormattedMessage id="newTransform.editor.preview.header" />
                </Typography>

                <Typography variant="caption">
                    <FormattedMessage id="newTransform.editor.preview.description" />
                </Typography>
            </Wrapper>
        </Grid>
    );
}

export default DerivationEditorHeader;
