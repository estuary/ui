import { Editor } from '@monaco-editor/react';
import { Box, Divider, Paper, useTheme } from '@mui/material';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import { editorToolBarSx } from 'context/Theme';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { logRocketConsole } from 'services/shared';
import { stringifyJSON } from 'services/stringify';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { DEFAULT_TOOLBAR_HEIGHT } from 'utils/editor-utils';
import { hasLength } from 'utils/misc-utils';

const EDITOR_HEIGHT = 400;

export default function StatusResponseViewer() {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const response = useEntityStatusStore((state) => state.response);

    if (response) {
        return (
            <Paper sx={{ width: '100%' }} variant="outlined">
                <Box
                    sx={{
                        ...editorToolBarSx,
                        minHeight: DEFAULT_TOOLBAR_HEIGHT,
                    }}
                />

                <Divider />

                <Editor
                    defaultLanguage="json"
                    height={EDITOR_HEIGHT}
                    onMount={(
                        editor: monacoEditor.editor.IStandaloneCodeEditor
                    ) => {
                        logRocketConsole('handlers:mount');
                        editorRef.current = editor;
                    }}
                    options={{
                        readOnly: true,
                        minimap: {
                            enabled: false,
                        },
                    }}
                    path={
                        hasLength(response.catalog_name)
                            ? response.catalog_name
                            : 'preset_status_path'
                    }
                    saveViewState={false}
                    theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                    value={stringifyJSON(response)}
                />
            </Paper>
        );
    } else {
        return <MonacoEditorSkeleton editorHeight={EDITOR_HEIGHT} />;
    }
}
