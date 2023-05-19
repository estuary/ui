import {
    Box,
    Button,
    Grid,
    GridSize,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { intensifiedOutline, intensifiedOutlineThick } from 'context/Theme';
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
                borderTop: intensifiedOutlineThick[theme.palette.mode],
                borderRight: intensifiedOutlineThick[theme.palette.mode],
                borderLeft: intensifiedOutlineThick[theme.palette.mode],
            }}
        >
            {children}
        </Grid>
    );
}

const headerStyle = { mb: 0.5, fontSize: 16, fontWeight: 500 };

function DerivationEditorHeader() {
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
                        <Button variant="outlined">Preview</Button>
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
