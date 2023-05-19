import { Grid, Typography, useTheme } from '@mui/material';
import MigrationList from 'components/transformation/create/DerivationEditor/Catalog/MigrationList';
import TransformList from 'components/transformation/create/DerivationEditor/Catalog/TransformList';
import DerivationEditorHeader from 'components/transformation/create/DerivationEditor/Header';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import { intensifiedOutlineThick } from 'context/Theme';
import { isEmpty } from 'lodash';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

function DerivationEditor() {
    const theme = useTheme();

    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();

    return (
        <Grid
            container
            sx={{
                border: intensifiedOutlineThick[theme.palette.mode],
                borderRadius: 3,
            }}
        >
            <DerivationEditorHeader />

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
                {catalogName && !isEmpty(transformConfigs) ? (
                    <SQLEditor entityName={catalogName} editorHeight={362} />
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

export default DerivationEditor;
