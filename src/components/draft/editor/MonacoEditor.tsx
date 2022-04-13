import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { supabaseClient, TABLES } from 'services/supabase';
import { useQuery, useSelectSingle } from 'supabase-swr';

type Props = {
    currentCatalog: string;
    draftId: string;
};

interface DraftSpec {
    catalog_name: string;
    spec_type: string;
    spec_patch: string;
    draft_id: string;
}

const DRAFT_SPECS_QUERY = `
    catalog_name,
    spec_type,
    spec_patch,
    draft_id
`;

function MonacoEditor({ draftId }: Props) {
    const theme = useTheme();

    const currentCatalog = useEditorStore(editorStoreSelectors.currentCatalog);

    const draftSpecQuery = useQuery<DraftSpec>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPECS_QUERY,
            filter: (query) =>
                query
                    .eq('draft_id', draftId)
                    .eq('catalog_name', currentCatalog ? currentCatalog : ''),
        },
        [currentCatalog]
    );
    const { data: draftSpec, mutate } = useSelectSingle(draftSpecQuery, {
        revalidateOnMount: true,
    });

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const handlers = {
        change: debounce(async () => {
            if (editorRef.current && draftSpec) {
                const newData = {
                    ...draftSpec.data,
                    spec_patch: JSON.parse(editorRef.current.getValue()),
                };

                supabaseClient
                    .from(TABLES.DRAFT_SPECS)
                    .update(newData)
                    .match({
                        draft_id: draftId,
                        catalog_name: currentCatalog,
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

    if (draftSpec?.data) {
        return (
            <Editor
                height="300px"
                defaultLanguage="json"
                theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                defaultValue={JSON.stringify(
                    draftSpec.data.spec_patch,
                    null,
                    2
                )}
                path={draftSpec.data.catalog_name}
                onMount={handlers.mount}
                onChange={handlers.change}
            />
        );
    } else {
        return <FormattedMessage id="common.loading" />;
    }
}

export default MonacoEditor;
