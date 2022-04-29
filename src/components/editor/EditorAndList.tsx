import { Grid } from '@mui/material';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor, {
    Props as MonacoEditorProps,
} from 'components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
}

const DEFAULT_HEIGHT = 350;

function EditorAndList(props: Props) {
    const { height } = props;
    const heightVal = height ?? DEFAULT_HEIGHT;

    return (
        <Grid
            container
            spacing={2}
            sx={{
                bgcolor: 'background.paper',
                height: heightVal,
            }}
        >
            <Grid
                item
                xs={4}
                md={3}
                sx={{ maxHeight: heightVal, overflowY: 'auto' }}
            >
                <EditorFileSelector />
            </Grid>
            <Grid item xs={8} md={9}>
                <MonacoEditor {...props} />
            </Grid>
        </Grid>
    );
}

export default EditorAndList;
