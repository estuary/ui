import Editor from '@monaco-editor/react';
import {
    Box,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';
import useEditorStore, { EditorState } from 'stores/EditorStore';
import { useQuery, useSelect } from 'supabase-swr';

type Props = {
    draftId: string;
};

interface DraftSpec {
    catalog_name: string;
    spec_type: string;
    spec_patch: string;
    draft_id: string;
}

const CONNECTOR_TAGS_QUERY = `
    catalog_name,
    spec_type,
    spec_patch,
    draft_id
`;

const selectors = {
    loadResource: (state: EditorState) => state.loadResource,
    updateResource: (state: EditorState) => state.updateResource,
};

function NewCaptureEditor({ draftId }: Props) {
    const loadResource = useEditorStore(selectors.loadResource);
    const updateResource = useEditorStore(selectors.updateResource);

    const draftSpecQuery = useQuery<DraftSpec>(
        TABLES.DRAFT_SPECS,
        {
            columns: CONNECTOR_TAGS_QUERY,
            filter: (query) => query.eq('draft_id', draftId),
        },
        []
    );
    const { data } = useSelect(draftSpecQuery, {});
    const tags: DraftSpec[] = data ? data.data : [];

    const theme = useTheme();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const handlers = {
        fileList: {
            click: (tagInex: number) => {
                setCurrentFileIndex(tagInex);
            },
        },
        change: () => {
            if (editorRef.current) {
                updateResource(
                    tags[currentFileIndex].catalog_name,
                    editorRef.current.getValue()
                );
            }
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;

            handlers.fileList.click(0);

            if (tags.length > 0) {
                tags.forEach((tag) => {
                    loadResource(tag.catalog_name, tag.spec_patch);
                });
            }

            // Commented out as it stands as the main example of how to handle "events"
            // const handler = editor.onDidChangeModelDecorations(() => {
            //     handler.dispose();
            //     void editor.getAction('editor.action.formatDocument').run();
            // });
        },
    };

    return (
        <>
            <Typography variant="h5">Catalog Editor</Typography>
            <Typography>
                <FormattedMessage id="captureCreation.finalReview.instructions" />
            </Typography>
            <Paper variant="outlined">
                {tags.length > 0 ? (
                    <Box
                        sx={{
                            flexGrow: 1,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            height: 300,
                        }}
                    >
                        <List dense disablePadding>
                            {tags.map((tag: any, index: number) => (
                                <ListItemButton
                                    key={`FileSelector-${tag.catalog_name}`}
                                    dense
                                    selected={index === currentFileIndex}
                                    onClick={() => {
                                        handlers.fileList.click(index);
                                    }}
                                >
                                    <ListItemText
                                        primary={tag.catalog_name}
                                        secondary={tag.spec_type}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                        <Editor
                            height="300px"
                            defaultLanguage="json"
                            theme={
                                theme.palette.mode === 'light'
                                    ? 'vs'
                                    : 'vs-dark'
                            }
                            defaultValue={JSON.stringify(
                                tags[currentFileIndex],
                                null,
                                2
                            )}
                            path={tags[currentFileIndex].catalog_name}
                            onMount={handlers.mount}
                            onChange={handlers.change}
                        />
                    </Box>
                ) : (
                    <FormattedMessage id="common.loading" />
                )}
            </Paper>
        </>
    );
}

export default NewCaptureEditor;
