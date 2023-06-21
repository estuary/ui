import { Box, Grid } from '@mui/material';
import DerivationEditorHeader from 'components/transformation/create/DerivationEditor/Header';
import ShuffleKeys from 'components/transformation/create/DerivationEditor/ShuffleKeys';
import SQLDataPreview from 'components/transformation/create/DerivationEditor/SQLDataPreview';
import SQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor';
import EmptySQLEditor from 'components/transformation/create/DerivationEditor/SQLEditor/Empty';
import { intensifiedOutline } from 'context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_catalogName,
    useTransformationCreate_migrations,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

const EDITOR_HEIGHT = 363;

function DerivationEditor() {
    // Transformation Create Store
    const catalogName = useTransformationCreate_catalogName();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();
    const attributeType = useTransformationCreate_attributeType();

    const showEditor = useMemo(
        () =>
            attributeType === 'transform'
                ? !isEmpty(transformConfigs)
                : !isEmpty(migrations),
        [attributeType, migrations, transformConfigs]
    );

    return (
        <Grid container>
            <DerivationEditorHeader />

            <Grid container wrap="nowrap">
                <Grid
                    item
                    xs={5}
                    sx={{
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
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
                        {catalogName && showEditor ? (
                            <SQLEditor
                                entityName={catalogName}
                                editorHeight={EDITOR_HEIGHT}
                            />
                        ) : (
                            <EmptySQLEditor editorHeight={EDITOR_HEIGHT} />
                        )}
                    </Box>

                    <ShuffleKeys />
                </Grid>

                <Grid
                    item
                    xs={4}
                    sx={{
                        minWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <SQLDataPreview />
                </Grid>
            </Grid>
        </Grid>
    );
}

export default DerivationEditor;
