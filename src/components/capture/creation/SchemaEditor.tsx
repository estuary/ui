import Editor from '@monaco-editor/react';
import {
    DialogContentText,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    useTheme,
} from '@mui/material';
import { DiscoveredCatalogAttributes } from 'endpoints/discoveredCatalog';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import useSchemaEditorStore, {
    SchemaEditorState,
} from 'stores/SchemaEditorStore';

type NewCaptureEditorProps = {
    data?: DiscoveredCatalogAttributes;
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

            const handler = editor.onDidChangeModelDecorations(() => {
                handler.dispose();
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
                    <Grid container>
                        <Grid item xs={2}>
                            <List dense>
                                {Object.keys(data.resources).map(
                                    (resourceName: any, index: number) => (
                                        <ListItem
                                            key={`FileSelector-${resourceName}-${index}`}
                                        >
                                            <ListItemText
                                                primary={resourceName}
                                                secondary={
                                                    data.resources[resourceName]
                                                        .contentType
                                                }
                                            />
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </Grid>
                        <Grid item xs={10}>
                            <Editor
                                height="350px"
                                defaultLanguage="json"
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                defaultValue={JSON.stringify(data)}
                                onMount={handlers.onMount}
                                onChange={handlers.onChange}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <FormattedMessage id="common.loading" />
                )}
            </Paper>
        </>
    );
}

export default NewCaptureEditor;
