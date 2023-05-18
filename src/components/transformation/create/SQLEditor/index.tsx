import { Grid, useTheme } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import SQLEditorHeader from 'components/transformation/create/SQLEditor/Header';
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
            <SQLEditorHeader />

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
