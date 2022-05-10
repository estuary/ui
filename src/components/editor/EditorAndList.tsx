import Box from '@mui/material/Box';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor, {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    Props as MonacoEditorProps,
} from 'components/editor/MonacoEditor';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

export interface Props extends MonacoEditorProps {
    height?: number;
}

const MIN_RESIZE_WIDTH = 25;

function EditorAndList(props: Props) {
    const { height } = props;
    const heightVal = (height ?? DEFAULT_HEIGHT) + DEFAULT_TOOLBAR_HEIGHT;

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                height: `${heightVal}px`,
                overflow: 'hidden',
                mb: 2,
            }}
        >
            <ReflexContainer orientation="vertical">
                <ReflexElement className="left-pane" minSize={MIN_RESIZE_WIDTH}>
                    <div className="pane-content" style={{ height: heightVal }}>
                        <EditorFileSelector />
                    </div>
                </ReflexElement>

                <ReflexSplitter
                    style={{
                        width: 4,
                    }}
                />

                <ReflexElement
                    className="right-pane"
                    minSize={MIN_RESIZE_WIDTH}
                    style={{
                        overflow: 'hidden',
                    }}
                >
                    <div className="pane-content">
                        <MonacoEditor {...props} />
                    </div>
                </ReflexElement>
            </ReflexContainer>
        </Box>
    );
}

export default EditorAndList;
