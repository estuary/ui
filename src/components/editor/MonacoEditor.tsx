import Editor, { DiffEditor } from '@monaco-editor/react';
import { Box, Divider, Paper, Stack, useTheme } from '@mui/material';
import Invalid from 'components/editor/Status/Invalid';
import Saved from 'components/editor/Status/Saved';
import Saving from 'components/editor/Status/Saving';
import ServerDiff from 'components/editor/Status/ServerDiff';
import { EditorStatus, EditorStoreState } from 'components/editor/Store';
import {
    DraftEditorStoreNames,
    LiveSpecEditorStoreNames,
    UseZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useMemo, useRef, useState } from 'react';
import { stringifyJSON } from 'services/stringify';

export interface Props {
    editorStoreName: DraftEditorStoreNames | LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
    disabled?: boolean;
    onChange?: (newVal: any, path: string, specType: string) => any;
    height?: number;
    toolbarHeight?: number;
}

export const DEFAULT_TOOLBAR_HEIGHT = 20;
export const DEFAULT_HEIGHT = 330;
export const DEFAULT_TOTAL_HEIGHT = DEFAULT_TOOLBAR_HEIGHT + DEFAULT_HEIGHT;
const ICON_SIZE = 15;

function MonacoEditor({
    editorStoreName,
    useZustandStore,
    disabled,
    height = DEFAULT_HEIGHT,
    onChange,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const serverUpdate = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['serverUpdate']
    >(editorStoreName, (state) => state.serverUpdate);

    const currentCatalog = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['currentCatalog']
    >(editorStoreName, (state) => state.currentCatalog);

    // TODO (editor store) Should just fetch these directly from the store?
    const catalogName = currentCatalog?.catalog_name ?? null;
    const catalogSpec = currentCatalog?.spec ?? null;
    const catalogType = currentCatalog?.spec_type ?? null;

    const status = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['status']
    >(editorStoreName, (state) => state.status);

    const setStatus = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setStatus']
    >(editorStoreName, (state) => state.setStatus);

    const [showServerDiff, setShowServerDiff] = useState(false);

    // TODO (sync editing)
    // useEffect(() => {
    //     if (editorRef.current) {
    //         const currentStringValue = editorRef.current.getValue();

    //         if (currentStringValue) {
    //             const currentEditorValue = JSON.parse(currentStringValue);

    //             if (!isEqual(currentEditorValue, serverUpdate)) {
    //                 setHasServerChanges(serverUpdate);
    //             } else {
    //                 setHasServerChanges(null);
    //             }
    //         }
    //     }

    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [serverUpdate]);

    const updateValue = () => {
        const currentValue = editorRef.current?.getValue();

        if (onChange && currentValue) {
            setStatus(EditorStatus.EDITING);

            let parsedVal;
            try {
                parsedVal = JSON.parse(currentValue);
            } catch {
                setStatus(EditorStatus.INVALID);
            }

            if (parsedVal && catalogName && catalogType) {
                setStatus(EditorStatus.SAVING);
                onChange(parsedVal, catalogName, catalogType)
                    .then(() => {
                        setStatus(EditorStatus.SAVED);
                    })
                    .catch(() => {
                        setStatus(EditorStatus.SAVE_FAILED);
                    });
            } else {
                setStatus(EditorStatus.INVALID);
            }
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedChange = useCallback(debounce(updateValue, 750), [
        catalogName,
    ]);

    const specAsString = useMemo(
        () => stringifyJSON(catalogSpec),
        [catalogSpec]
    );

    const handlers = {
        change: () => {
            if (status !== EditorStatus.EDITING) {
                setStatus(EditorStatus.EDITING);
            }
            debouncedChange();
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
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
                        direction="row"
                        sx={{
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
                            <Saving iconSize={ICON_SIZE} />
                        ) : (
                            <Saved iconSize={ICON_SIZE} />
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
