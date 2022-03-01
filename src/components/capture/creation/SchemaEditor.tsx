import Editor from '@monaco-editor/react';
import { DialogContentText, Paper, useTheme } from '@mui/material';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import useSchemaEditorStore, {
    SchemaEditorState,
} from '../../../stores/SchemaEditorStore';

type NewCaptureEditorProps = {
    data: object | null;
};

const setSchemaSelector = (state: SchemaEditorState) => state.setSchema;

function NewCaptureEditor(props: NewCaptureEditorProps) {
    const setSchema = useSchemaEditorStore(setSchemaSelector);

    const { data } = props;

    const theme = useTheme();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const handlers = {
        onChange: () => {
            if (editorRef.current) {
                setSchema(editorRef.current.getValue());
            }
        },
        onMount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;

            const formatHandler = editor.onDidChangeModelDecorations(() => {
                formatHandler.dispose();
                void editor.getAction('editor.action.formatDocument').run();
            });
        },
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
                        onMount={handlers.onMount}
                        onChange={handlers.onChange}
                    />
                ) : (
                    <FormattedMessage id="common.loading" />
                )}
            </Paper>
        </>
    );
}

export default NewCaptureEditor;
