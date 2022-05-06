import Editor, { DiffEditor } from '@monaco-editor/react';
import { Box, Divider, Paper, Stack, useTheme } from '@mui/material';
import Saved from 'components/editor/Status/Saved';
import Saving from 'components/editor/Status/Saving';
import ServerDiff from 'components/editor/Status/ServerDiff';
import { EditorStoreState } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { debounce, isEqual } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

export interface Props {
    disabled?: boolean;
    value: any;
    path: string;
    onChange?: (newVal: any, path: string) => any;
    height?: number;
}

const DEFAULT_HEIGHT = 350;
const ICON_SIZE = 15;

function MonacoEditor({ disabled, value, path, height, onChange }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const heightVal = height ?? DEFAULT_HEIGHT;
    const [isChanging, setIsChanging] = useState<boolean | null>(null);
    const [hasServerChanges, setHasServerChanges] = useState<any | null>(null);
    const [showServerDiff, setShowServerDiff] = useState(false);

    const serverUpdate = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['serverUpdate']
    >((state) => state.serverUpdate);

    useEffect(() => {
        if (editorRef.current) {
            const currentStringValue = editorRef.current.getValue();

            if (currentStringValue) {
                const currentEditorValue = JSON.parse(currentStringValue);

                if (!isEqual(currentEditorValue, serverUpdate)) {
                    setHasServerChanges(serverUpdate);
                } else {
                    setHasServerChanges(null);
                }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverUpdate]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const bar = useCallback(
        debounce((val: string | undefined) => {
            console.log('debounce', {
                val,
                curr: editorRef.current?.getValue(),
            });
            if (val && onChange) {
                setIsChanging(true);
                onChange(JSON.parse(val), path)
                    .then(() => {
                        setIsChanging(false);
                    })
                    .catch(() => {
                        setIsChanging(false);
                    });
            }
        }, 750),
        []
    );

    const handlers = {
        change: (val: string | undefined) => {
            setIsChanging(true);
            bar(val);
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
                        minHeight: 20,
                    }}
                >
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'end',
                            alignItems: 'center',
                        }}
                    >
                        {hasServerChanges ? (
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
                        height="400px"
                        original={editorRef.current.getValue()}
                        modified={JSON.stringify(serverUpdate, null, 2)}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                    />
                ) : (
                    <Editor
                        height={`${heightVal}px`}
                        defaultLanguage="json"
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        defaultValue={intl.formatMessage({
                            id: 'common.loading',
                        })}
                        value={JSON.stringify(value, null, 2)}
                        path={path}
                        options={{
                            readOnly: disabled ? disabled : false,
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
