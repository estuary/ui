import { Grid, Typography, useTheme } from '@mui/material';
import MigrationList from 'components/transformation/create/SQLEditor/Catalog/MigrationList';
import TransformList from 'components/transformation/create/SQLEditor/Catalog/TransformList';
import SQLEditorHeader from 'components/transformation/create/SQLEditor/Header';
import LambdaEditor from 'components/transformation/create/SQLEditor/LambdaEditor';
import { intensifiedOutlineThick } from 'context/Theme';
import { useTransformationCreate_catalogName } from 'stores/TransformationCreate/hooks';

function SQLEditor() {
    const theme = useTheme();

    const catalogName = useTransformationCreate_catalogName();
    // const transformConfigs = useTransformationCreate_transformConfigs();

    return (
        <Grid
            container
            sx={{
                border: intensifiedOutlineThick[theme.palette.mode],
                borderRadius: 3,
            }}
        >
            <SQLEditorHeader />

            <Grid
                item
                xs={3}
                sx={{
                    borderRight: intensifiedOutlineThick[theme.palette.mode],
                }}
            >
                <TransformList />

                <MigrationList />
            </Grid>

            <Grid
                item
                xs={5}
                sx={{
                    borderRight: intensifiedOutlineThick[theme.palette.mode],
                }}
            >
                {catalogName ? (
                    <LambdaEditor entityName={catalogName} editorHeight={362} />
                ) : (
                    <span>Failure</span>
                )}
            </Grid>

            <Grid item xs={4} sx={{ p: 1 }}>
                <Typography>Click RUN to execute your query.</Typography>
            </Grid>
        </Grid>
    );
}

export default SQLEditor;
