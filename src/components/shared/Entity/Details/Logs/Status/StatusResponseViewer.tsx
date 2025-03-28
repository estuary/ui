import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { useRef } from 'react';

import { Box, Divider, Paper, useTheme } from '@mui/material';

import { Editor } from '@monaco-editor/react';

import { MonacoEditorSkeleton } from 'src/components/editor/MonacoEditor/EditorSkeletons';
import { editorToolBarSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole } from 'src/services/shared';
import { stringifyJSON } from 'src/services/stringify';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { DEFAULT_TOOLBAR_HEIGHT } from 'src/utils/editor-utils';
import { hasLength } from 'src/utils/misc-utils';

const EDITOR_HEIGHT = 400;

export default function StatusResponseViewer() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const loading = useEntityStatusStore(
        (state) => !state.hydrated || state.active
    );
    const response = useEntityStatusStore_singleResponse(catalogName);

    if (loading) {
        return <MonacoEditorSkeleton editorHeight={EDITOR_HEIGHT} />;
    }

    return (
        <Paper sx={{ width: '100%' }} variant="outlined">
            <Box
                sx={{
                    ...editorToolBarSx,
                    minHeight: DEFAULT_TOOLBAR_HEIGHT,
                }}
            />

            <Divider />

            {response ? (
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
            ) : (
                <Box height={EDITOR_HEIGHT} />
            )}
        </Paper>
    );
}
