import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';

interface Props {
    disabled?: boolean;
    value: any;
    path: string;
    onChange?: (newVal: any) => void;
}

function MonacoEditor({ disabled, value, path, onChange }: Props) {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const handlers = {
        change: debounce(async () => {
            if (editorRef.current && onChange) {
                onChange(JSON.parse(editorRef.current.getValue()));
            }
        }, 1000),
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
    };

    if (value) {
        return (
            <Editor
                height="300px"
                defaultLanguage="json"
                theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                defaultValue={JSON.stringify(value, null, 2)}
                path={path}
                options={{ readOnly: disabled ? disabled : false }}
                onMount={handlers.mount}
                onChange={
                    typeof onChange === 'function' ? handlers.change : undefined
                }
            />
        );
    } else {
        return null;
    }
}

export default MonacoEditor;
