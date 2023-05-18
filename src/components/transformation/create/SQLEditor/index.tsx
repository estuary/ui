import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Button,
    Grid,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import TransformList from 'components/transformation/create/SQLEditor/TransformList';
import { intensifiedOutline, intensifiedOutlineThick } from 'context/Theme';

function SQLEditor() {
    const theme = useTheme();

    // const transformConfigs = useTransformationCreate_transformConfigs();

    return (
        <Grid
            container
            sx={{
                border: intensifiedOutlineThick[theme.palette.mode],
                borderRadius: 3,
            }}
        >
            <Grid container>
                <Grid
                    item
                    xs={3}
                    sx={{
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        borderBottom: intensifiedOutline[theme.palette.mode],
                        borderRight:
                            intensifiedOutlineThick[theme.palette.mode],
                    }}
                >
                    <Typography sx={{ mb: 0.5, fontSize: 16, fontWeight: 500 }}>
                        Catalog
                    </Typography>

                    <Typography variant="caption">
                        This is a placeholder for a section description
                    </Typography>
                </Grid>

                <Grid
                    item
                    xs={5}
                    sx={{
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        borderBottom: intensifiedOutline[theme.palette.mode],
                        borderRight:
                            intensifiedOutlineThick[theme.palette.mode],
                    }}
                >
                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{ justifyContent: 'space-between' }}
                    >
                        <Box>
                            <Typography
                                sx={{ mb: 0.5, fontSize: 16, fontWeight: 500 }}
                            >
                                Streaming
                            </Typography>

                            <Typography variant="caption">
                                Used for selecting columns and creating
                                aggregations
                            </Typography>
                        </Box>

                        <Box>
                            <Autocomplete
                                options={['Simple Select']}
                                // defaultValue={transformConfigs['Template1']}
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
                </Grid>

                <Grid
                    item
                    xs={4}
                    sx={{
                        pt: 1.5,
                        pb: 1,
                        px: 1,
                        borderBottom: intensifiedOutline[theme.palette.mode],
                    }}
                >
                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{ justifyContent: 'space-between' }}
                    >
                        <Box>
                            <Typography
                                sx={{ mb: 0.5, fontSize: 16, fontWeight: 500 }}
                            >
                                Preview
                            </Typography>

                            <Typography variant="caption">
                                This is a placeholder for a section description
                            </Typography>
                        </Box>

                        <Box>
                            <Button variant="outlined">Run</Button>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>

            <Grid
                item
                xs={3}
                sx={{
                    borderRight: intensifiedOutlineThick[theme.palette.mode],
                }}
            >
                <TransformList
                    borderBottom={intensifiedOutline[theme.palette.mode]}
                />

                <TransformList minHeight={200} />
            </Grid>

            <Grid
                item
                xs={5}
                sx={{
                    borderRight: intensifiedOutlineThick[theme.palette.mode],
                }}
            >
                <DraftSpecEditor entityType="collection" editorHeight={380} />
            </Grid>

            <Grid item xs={4}>
                <span>Some Editor...</span>
            </Grid>
        </Grid>
    );
}

export default SQLEditor;
