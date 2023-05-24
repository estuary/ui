import Editor, { DiffEditor } from '@monaco-editor/react';
import { Box, Divider, Paper, Stack, useTheme } from '@mui/material';
import Invalid from 'components/editor/Status/Invalid';
import ServerDiff from 'components/editor/Status/ServerDiff';
import Synchronized from 'components/editor/Status/Synchronized';
import Synchronizing from 'components/editor/Status/Synchronizing';
import {
    useEditorStore_currentCatalog,
    useEditorStore_serverUpdate,
    useEditorStore_setStatus,
    useEditorStore_status,
} from 'components/editor/Store/hooks';
import { EditorStatus } from 'components/editor/Store/types';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useMemo, useRef, useState } from 'react';
import { stringifyJSON } from 'services/stringify';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    ICON_SIZE,
} from 'utils/editor-utils';
import { AllowedScopes } from './types';

type onChange = (
    newVal: any,
    path: string,
    specType: string,
    scope?: AllowedScopes
) => any;

export interface MonacoEditorProps {
    localZustandScope: boolean;
    disabled?: boolean;
    onChange?: onChange;
    height?: number;
    toolbarHeight?: number;
    editorSchemaScope?: AllowedScopes; // Used to scop the schema editor
}

function MonacoEditor({
    localZustandScope,
    disabled,
    height = DEFAULT_HEIGHT,
    onChange,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
    editorSchemaScope,
}: MonacoEditorProps) {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const serverUpdate = useEditorStore_serverUpdate({
        localScope: localZustandScope,
    });

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    // TODO (editor store) Should just fetch these directly from the store?
    const catalogName = currentCatalog?.catalog_name ?? null;
    const catalogSpec = currentCatalog?.spec ?? null;
    const catalogType = currentCatalog?.spec_type ?? null;

    const status = useEditorStore_status({ localScope: localZustandScope });
    const setStatus = useEditorStore_setStatus({
        localScope: localZustandScope,
    });

    const [showServerDiff, setShowServerDiff] = useState(false);

    const updateValue = () => {
        console.log('editor:update');
        const currentValue = editorRef.current?.getValue();
        console.log('editor:update:current', {
            currentValue,
        });
        if (onChange && currentValue) {
            setStatus(EditorStatus.EDITING);

            let parsedVal;
            try {
                parsedVal = JSON.parse(currentValue);
                console.log('editor:update:parsed');
            } catch {
                setStatus(EditorStatus.INVALID);
            }

            if (parsedVal && catalogName && catalogType) {
                console.log('editor:update:saving', {
                    parsedVal,
                    catalogName,
                    catalogType,
                });
                setStatus(EditorStatus.SAVING);

                if (editorSchemaScope) {
                    console.log('editor:update:saving:scoped', {
                        nestedProperty: editorSchemaScope,
                    });
                    onChange(
                        parsedVal,
                        catalogName,
                        catalogType,
                        editorSchemaScope
                    )
                        .then(() => {
                            console.log('editor:update:saving:scoped:success');
                            setStatus(EditorStatus.SAVED);
                        })
                        .catch(() => {
                            console.log('editor:update:saving:scoped:failed');
                            setStatus(EditorStatus.SAVE_FAILED);
                        });
                } else {
                    onChange(parsedVal, catalogName, catalogType)
                        .then(() => {
                            console.log('editor:update:saving:success');
                            setStatus(EditorStatus.SAVED);
                        })
                        .catch(() => {
                            console.log('editor:update:saving:failed');
                            setStatus(EditorStatus.SAVE_FAILED);
                        });
                }
            } else {
                console.log('editor:update:invalid', {
                    parsedVal,
                    catalogName,
                    catalogType,
                });
                setStatus(EditorStatus.INVALID);
            }
        } else {
            console.log('editor:update:missing', {
                onChange,
                currentValue,
            });
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedChange = useCallback(debounce(updateValue, 750), [
        catalogName,
    ]);

    const specAsString = useMemo(() => {
        let spec: any;
        if (editorSchemaScope) {
            // If there is a schema sdcope make sure it exists first
            //  otherwise we will fall back to the schema prop
            // This is just being super safe
            if (catalogSpec[editorSchemaScope]) {
                spec = catalogSpec[editorSchemaScope];
            } else {
                spec = catalogSpec.schema;
            }
        } else {
            spec = catalogSpec;
        }
        return stringifyJSON(spec);
    }, [catalogSpec, editorSchemaScope]);

    const handlers = {
        change: (value: any, ev: any) => {
            console.log('handlers:change', {
                status,
                value,
                ev,
            });
            if (status !== EditorStatus.EDITING) {
                setStatus(EditorStatus.EDITING);
            }
            debouncedChange();
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            console.log('handlers:mount');
            editorRef.current = editor;
        },
        merge: () => {
            setShowServerDiff(!showServerDiff);
        },
    };

    if (catalogName && specAsString) {
        return (
            <Paper sx={{ width: '100%' }} variant="outlined">
                <Box
                    sx={{
                        minHeight: toolbarHeight,
                    }}
                >
                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{
                            py: 0.5,
                            px: 1,
                            justifyContent: 'end',
                            alignItems: 'center',
                        }}
                    >
                        {/* TODO (editor) Need to get the save failure state working */}
                        {status === EditorStatus.INVALID ||
                        status === EditorStatus.SAVE_FAILED ? (
                            <Invalid iconSize={ICON_SIZE} />
                        ) : status === EditorStatus.OUT_OF_SYNC ? (
                            <ServerDiff
                                iconSize={ICON_SIZE}
                                onMerge={handlers.merge}
                            />
                        ) : status === EditorStatus.IDLE ? null : status ===
                          EditorStatus.EDITING ? (
                            <Synchronizing iconSize={ICON_SIZE} />
                        ) : (
                            <Synchronized iconSize={ICON_SIZE} />
                        )}
                    </Stack>
                </Box>

                <Divider />

                {showServerDiff && serverUpdate && editorRef.current ? (
                    <DiffEditor
                        height={`${height}px`}
                        original={editorRef.current.getValue()}
                        modified={stringifyJSON(serverUpdate)}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                    />
                ) : (
                    <Editor
                        height={`${height}px`}
                        defaultLanguage="json"
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        saveViewState={false}
                        defaultValue={specAsString}
                        value={specAsString}
                        path={catalogName}
                        options={{
                            readOnly: disabled ? disabled : false,
                            minimap: {
                                enabled: false,
                            },
                        }}
                        onMount={handlers.mount}
                        onChange={
                            typeof onChange === 'function'
                                ? handlers.change
                                : undefined
                        }
                    />
                )}
            </Paper>
        );
    } else {
        return null;
    }
}

export default MonacoEditor;
