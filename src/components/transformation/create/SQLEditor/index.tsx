import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { intensifiedOutline } from 'context/Theme';

function SQLEditor() {
    return (
        <Grid
            container
            sx={{
                border: (theme) => intensifiedOutline[theme.palette.mode],
            }}
        >
            <Grid
                item
                xs={3}
                sx={{
                    borderRight: (theme) =>
                        intensifiedOutline[theme.palette.mode],
                }}
            >
                <Box
                    sx={{
                        height: 72,
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        borderBottom: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                        Catalog
                    </Typography>
                </Box>

                <span>Transform</span>
            </Grid>

            <Grid
                item
                xs={5}
                sx={{
                    borderRight: (theme) =>
                        intensifiedOutline[theme.palette.mode],
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        height: 72,
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        justifyContent: 'space-between',
                        borderBottom: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                    }}
                >
                    <Box>
                        <Typography
                            sx={{ mb: 0.5, fontSize: 16, fontWeight: 500 }}
                        >
                            Streaming
                        </Typography>

                        <Typography variant="caption">
                            Used for selecting columns and creating aggregations
                        </Typography>
                    </Box>

                    <Box>
                        <Autocomplete
                            options={['Simple Select']}
                            renderInput={({
                                InputProps,
                                ...params
                            }: AutocompleteRenderInputParams) => (
                                <TextField
                                    {...params}
                                    InputProps={{
                                        ...InputProps,
                                        sx: { borderRadius: 3 },
                                    }}
                                    label="SQL Template"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                            disableClearable
                            sx={{ minWidth: 150 }}
                        />
                    </Box>
                </Stack>

                <DraftSpecEditor entityType="collection" />
            </Grid>

            <Grid item xs={4}>
                <Box
                    sx={{
                        height: 72,
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        borderBottom: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                        Preview
                    </Typography>
                </Box>

                <span>Some Editor...</span>
            </Grid>
        </Grid>
    );
}

export default SQLEditor;
