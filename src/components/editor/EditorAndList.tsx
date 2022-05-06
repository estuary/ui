import { Grid } from '@mui/material';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor, {
    Props as MonacoEditorProps,
} from 'components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
}

const DEFAULT_TOOLBAR_HEIGHT = 20;
const DEFAULT_HEIGHT = 330;

function EditorAndList(props: Props) {
    const { height } = props;
    const heightVal = height ?? DEFAULT_HEIGHT;

    return (
        <Grid
            container
            sx={{
                bgcolor: 'background.paper',
                height: `${heightVal + DEFAULT_TOOLBAR_HEIGHT}px`,
                mb: 2,
            }}
        >
            <Grid
                item
                xs={4}
                md={3}
                sx={{
                    overflow: 'auto',
                }}
            >
                <EditorFileSelector />
            </Grid>
            <Grid item xs={8} md={9}>
                <MonacoEditor
                    {...props}
                    toolbarHeight={DEFAULT_TOOLBAR_HEIGHT}
                />
            </Grid>
        </Grid>
    );
}

export default EditorAndList;
