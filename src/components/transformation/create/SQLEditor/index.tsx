import { Grid, Typography, useTheme } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import CatalogList from 'components/transformation/create/SQLEditor/CatalogList';
import SQLEditorHeader from 'components/transformation/create/SQLEditor/Header';
import LambdaEditor from 'components/transformation/create/SQLEditor/LambdaEditor';
import { intensifiedOutline, intensifiedOutlineThick } from 'context/Theme';
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
                <CatalogList
                    contentType="transform"
                    borderBottom={intensifiedOutline[theme.palette.mode]}
                />

                <CatalogList contentType="migration" minHeight={200} />
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
                <AlertBox severity="info" short>
                    <Typography>Click RUN to execute your query.</Typography>
                </AlertBox>
            </Grid>
        </Grid>
    );
}

export default SQLEditor;
