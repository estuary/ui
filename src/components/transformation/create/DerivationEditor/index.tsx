import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import MigrationList from 'components/transformation/create/DerivationEditor/Catalog/MigrationList';
import TransformList from 'components/transformation/create/DerivationEditor/Catalog/TransformList';
import DerivationEditorHeader from 'components/transformation/create/DerivationEditor/Header';
import ShuffleKeys from 'components/transformation/create/DerivationEditor/ShuffleKeys';
import SQLDataPreview from 'components/transformation/create/DerivationEditor/SQLDataPreview';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import { intensifiedOutline } from 'context/Theme';
import { isEmpty } from 'lodash';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

const EDITOR_HEIGHT = 362;

function DerivationEditor() {
    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();

    return (
        <Grid container>
            <DerivationEditorHeader />

            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
                <TransformList />

                <MigrationList />
            </Grid>

            <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        borderBottom: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                        borderRight: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                        borderLeft: (theme) =>
                            intensifiedOutline[theme.palette.mode],
                    }}
                >
                    {catalogName &&
                    !(isEmpty(transformConfigs) && isEmpty(migrations)) ? (
                        <SQLEditor
                            entityName={catalogName}
                            editorHeight={EDITOR_HEIGHT}
                        />
                    ) : (
                        <>
                            <Box sx={{ height: 37 }} />

                            <Divider />

                            <Box sx={{ height: EDITOR_HEIGHT, p: 1 }}>
                                <Typography>No SQL file selected.</Typography>
                            </Box>
                        </>
                    )}
                </Box>

                <ShuffleKeys />
            </Grid>

            <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                <SQLDataPreview />
            </Grid>

            <Grid
                item
                xs={12}
                sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}
            >
                <Button variant="outlined" sx={{ mr: 2 }}>
                    Proceed to GitPod
                </Button>

                <Button>Publish</Button>
            </Grid>
        </Grid>
    );
}

export default DerivationEditor;
