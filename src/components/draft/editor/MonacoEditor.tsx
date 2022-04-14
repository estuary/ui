import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { supabaseClient, TABLES } from 'services/supabase';

function MonacoEditor() {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const draftId = useEditorStore(editorStoreSelectors.draftId);
    const currentCatalog = useEditorStore(editorStoreSelectors.currentCatalog);
    const { draftSpecs, mutate } = useDraftSpecs(draftId);
    const draftSpec = draftSpecs[currentCatalog]
        ? draftSpecs[currentCatalog]
        : null;

    const handlers = {
        change: debounce(async () => {
            if (editorRef.current && draftSpec) {
                const newData = {
                    ...draftSpec,
                    spec_patch: JSON.parse(editorRef.current.getValue()),
                };

                supabaseClient
                    .from(TABLES.DRAFT_SPECS)
                    .update(newData)
                    .match({
                        draft_id: draftId,
                        catalog_name: draftSpec.catalog_name,
                    })
                    .then(
                        () => {},
                        () => {}
                    );

                mutate()
                    .then(() => {})
                    .catch(() => {});
            }
        }, 1000),
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
    };

    if (draftSpec) {
        return (
            <Editor
                height="300px"
                defaultLanguage="json"
                theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                defaultValue={JSON.stringify(draftSpec.spec_patch, null, 2)}
                path={draftSpec.catalog_name}
                onMount={handlers.mount}
                onChange={handlers.change}
            />
        );
    } else if (!draftId) {
        return null;
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default MonacoEditor;
