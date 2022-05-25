import Editor, { DiffEditor } from '@monaco-editor/react';
import { Box, Divider, Paper, Stack, useTheme } from '@mui/material';
import Invalid from 'components/editor/Status/Invalid';
import Saved from 'components/editor/Status/Saved';
import Saving from 'components/editor/Status/Saving';
import ServerDiff from 'components/editor/Status/ServerDiff';
import { EditorStoreState } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDebounce } from 'react-use';
import { stringifyJSON } from 'services/stringify';

export interface Props {
    disabled?: boolean;
    value: any;
    path: string;
    onChange?: (newVal: any, path: string, specType: string) => any;
    height?: number;
    toolbarHeight?: number;
}

export const DEFAULT_TOOLBAR_HEIGHT = 20;
export const DEFAULT_HEIGHT = 330;
export const DEFAULT_TOTAL_HEIGHT = DEFAULT_TOOLBAR_HEIGHT + DEFAULT_HEIGHT;
const ICON_SIZE = 15;

function MonacoEditor({
    disabled,
    value,
    path,
    height = DEFAULT_HEIGHT,
    onChange,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const [lastValue, setLastValue] = useState<string | null>('');
    const [storedPath] = useState(path);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isChanging, setIsChanging] = useState<boolean | null>(null);
    const [hasServerChanges] = useState<boolean>(false);
    const [showServerDiff, setShowServerDiff] = useState(false);

    const serverUpdate = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['serverUpdate']
    >((state) => state.serverUpdate);

    const currentCatalog = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

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

    useDebounce(
        () => {
            if (lastValue && onChange) {
                setIsChanging(true);

                let parsedVal;
                try {
                    parsedVal = JSON.parse(lastValue);
                } catch {
                    console.log('faied to parse');
                    setIsInvalid(true);
                    setIsChanging(false);
                }

                if (parsedVal) {
                    onChange(parsedVal, storedPath, currentCatalog.spec_type)
                        .then(() => {
                            console.log('3s');
                            setIsInvalid(false);
                            setIsChanging(false);
                        })
                        .catch((error: any) => {
                            console.log('3e');
                            console.log('error', error);
                            setIsInvalid(false);
                            setIsChanging(false);
                        });
                } else {
                    setIsChanging(false);
                }
            }
        },
        1000,
        [lastValue]
    );

    const handlers = {
        change: (val: any) => {
            setIsChanging(true);
            setLastValue(val);
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
        merge: () => {
            setShowServerDiff(!showServerDiff);
        },
    };

    if (value) {
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
                        {isInvalid ? (
                            <Invalid iconSize={ICON_SIZE} />
                        ) : hasServerChanges ? (
                            <ServerDiff
                                iconSize={ICON_SIZE}
                                onMerge={handlers.merge}
                            />
                        ) : isChanging === null ? null : isChanging ? (
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
                        defaultValue={intl.formatMessage({
                            id: 'common.loading',
                        })}
                        value={stringifyJSON(value)}
                        path={storedPath}
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
