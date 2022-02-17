import Editor from '@monaco-editor/react';
import { DialogContentText, Paper, useTheme } from '@mui/material';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

type NewCaptureEditorProps = {
    data: object | null;
};

function NewCaptureEditor(props: NewCaptureEditorProps) {
    const { data } = props;

    const theme = useTheme();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const handleEditorDidMount = (
        editor: monacoEditor.editor.IStandaloneCodeEditor
    ) => {
        editorRef.current = editor;
        const handler = editor.onDidChangeModelDecorations(() => {
            handler.dispose();
            editor.getAction('editor.action.formatDocument').run();
        });
    };

    return (
        <>
            <DialogContentText>
                <FormattedMessage id="captureCreation.finalReview.instructions" />
            </DialogContentText>
            <Paper variant="outlined">
                {data ? (
                    <Editor
                        height="350px"
                        defaultLanguage="json"
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        defaultValue={JSON.stringify(data)}
                        onMount={handleEditorDidMount}
                    />
                ) : (
                    <FormattedMessage id="common.loading" />
                )}
            </Paper>
        </>
    );
}

export default NewCaptureEditor;
