import Editor from '@monaco-editor/react';
import {
    Box,
    DialogContentText,
    List,
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

    const handlers = {
        fileList: {
            click: (resourceName: string) => {
                setCurrentFileName(resourceName);
                setCurrentFile(data?.resources[resourceName].content);
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

            // Commented out as it stands as the main example of how to handle "events"
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
                    <Box
                        sx={{
                            flexGrow: 1,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            height: 300,
                        }}
                    >
                        <List dense disablePadding>
                            {resourceList.map(
                                (resourceName: any, index: number) => (
                                    <ListItemButton
                                        key={`FileSelector-${resourceName}-${index}`}
                                        dense
                                        selected={
                                            resourceName === currentFileName
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
                                                data.resources[resourceName]
                                                    .contentType
                                            }
                                        />
                                    </ListItemButton>
                                )
                            )}
                        </List>
                        <Editor
                            height="300px"
                            defaultLanguage="json"
                            theme={
                                theme.palette.mode === 'light'
                                    ? 'vs'
                                    : 'vs-dark'
                            }
                            defaultValue={JSON.stringify(currentFile, null, 2)}
                            path={currentFileName}
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
