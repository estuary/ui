import Editor from '@monaco-editor/react';
import {
    DialogContentText,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    useTheme,
} from '@mui/material';
import { DiscoveredCatalogAttributes } from 'endpoints/discoveredCatalog';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
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

    const resourceList = data ? Object.keys(data.resources) : [];
    const [currentFileName, setCurrentFileName] = useState('');
    const [currentFile, setCurrentFile] = useState({});

    const formatJSON = (val = {}) => {
        try {
            return JSON.stringify(val, null, 2);
        } catch {
            const errorJson = {
                error: 'There was an issue parsing the JSON',
            };
            return JSON.stringify(errorJson, null, 2);
        }
    };

    const handlers = {
        fileList: {
            click: (resourceName: string) => {
                setCurrentFileName(resourceName);
                setCurrentFile(data?.resources[resourceName]);
            },
        },
        change: () => {
            if (editorRef.current) {
                setSchema(editorRef.current.getValue());
            }
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;

            handlers.fileList.click(resourceList[0]);

            // const handler = editor.onDidChangeModelDecorations(() => {
            //     handler.dispose();
            //     void editor.getAction('editor.action.formatDocument').run();
            // });
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
                        <Grid
                            item
                            xs={3}
                            sx={{
                                overflow: 'auto',
                            }}
                        >
                            <List dense>
                                {resourceList.map(
                                    (resourceName: any, index: number) => (
                                        <ListItem
                                            key={`FileSelector-${resourceName}-${index}`}
                                        >
                                            <ListItemButton
                                                selected={
                                                    resourceName ===
                                                    currentFileName
                                                }
                                                onClick={() => {
                                                    handlers.fileList.click(
                                                        resourceName
                                                    );
                                                }}
                                            >
                                                <ListItemText
                                                    primary={resourceName}
                                                    secondary={
                                                        data.resources[
                                                            resourceName
                                                        ].contentType
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                )}
                            </List>
                        </Grid>
                        <Grid item xs={9}>
                            <Editor
                                height="350px"
                                defaultLanguage="json"
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                defaultValue={formatJSON(currentFile)}
                                path={currentFileName}
                                onMount={handlers.mount}
                                onChange={handlers.change}
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
