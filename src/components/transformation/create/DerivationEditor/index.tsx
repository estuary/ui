import { Box, Grid, Typography } from '@mui/material';
import MigrationList from 'components/transformation/create/DerivationEditor/Catalog/MigrationList';
import TransformList from 'components/transformation/create/DerivationEditor/Catalog/TransformList';
import DerivationEditorHeader from 'components/transformation/create/DerivationEditor/Header';
import ShuffleKeys from 'components/transformation/create/DerivationEditor/ShuffleKeys';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import { intensifiedOutline, intensifiedOutlineThick } from 'context/Theme';
import { isEmpty } from 'lodash';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

function DerivationEditor() {
    // const theme = useTheme();

    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();

    return (
        <Grid container>
            <DerivationEditorHeader />

            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
                <TransformList />

                <MigrationList />
            </Grid>

            <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                {catalogName && !isEmpty(transformConfigs) ? (
                    <Box
                        sx={{
                            borderBottom: (theme) =>
                                intensifiedOutline[theme.palette.mode],
                            borderRight: (theme) =>
                                intensifiedOutlineThick[theme.palette.mode],
                            borderLeft: (theme) =>
                                intensifiedOutlineThick[theme.palette.mode],
                        }}
                    >
                        <SQLEditor
                            entityName={catalogName}
                            editorHeight={362}
                        />
                    </Box>
                ) : (
                    <span>Failure</span>
                )}

                <ShuffleKeys />
            </Grid>

            <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        p: 1,
                        flexGrow: 1,
                        borderBottom: (theme) =>
                            intensifiedOutlineThick[theme.palette.mode],
                        borderRight: (theme) =>
                            intensifiedOutlineThick[theme.palette.mode],
                        borderLeft: (theme) =>
                            intensifiedOutlineThick[theme.palette.mode],
                    }}
                >
                    <Typography>Click RUN to execute your query.</Typography>
                </Box>
            </Grid>
        </Grid>
    );
}

export default DerivationEditor;
