import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { useIntl } from 'react-intl';

export interface Props {
    disabled?: boolean;
    value: any;
    path: string;
    onChange?: (newVal: any, path: string) => void;
    height?: number;
}

const DEFAULT_HEIGHT = 350;

function MonacoEditor({ disabled, value, path, height, onChange }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const heightVal = height ?? DEFAULT_HEIGHT;

    const handlers = {
        change: debounce(async (val) => {
            if (editorRef.current && onChange) {
                onChange(JSON.parse(val), path);
            }
        }, 1000),
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
    };

    if (value) {
        return (
            <Editor
                height={`${heightVal}px`}
                defaultLanguage="json"
                theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                defaultValue={intl.formatMessage({ id: 'common.loading' })}
                value={JSON.stringify(value, null, 2)}
                path={path}
                options={{
                    readOnly: disabled ? disabled : false,
                }}
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
