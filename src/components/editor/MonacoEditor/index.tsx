import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    Box,
    Divider,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import Editor, { DiffEditor } from '@monaco-editor/react';
import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import Invalid from 'src/components/editor/Status/Invalid';
import ServerDiff from 'src/components/editor/Status/ServerDiff';
import Synchronized from 'src/components/editor/Status/Synchronized';
import Synchronizing from 'src/components/editor/Status/Synchronizing';
import {
    useEditorStore_currentCatalog,
    useEditorStore_serverUpdate,
    useEditorStore_setStatus,
    useEditorStore_statuses,
} from 'src/components/editor/Store/hooks';
import { EditorStatus } from 'src/components/editor/Store/types';
import { editorToolBarSx } from 'src/context/Theme';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { stringifyJSON } from 'src/services/stringify';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    getEditorEventType,
    ICON_SIZE,
    ignorableEditorException,
} from 'src/utils/editor-utils';

function MonacoEditor({
    localZustandScope,
    disabled,
    height = DEFAULT_HEIGHT,
    onChange,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
    editorSchemaScope,
    defaultLanguage = 'json',
    defaultValue,
    path,
    editorLabel,
    manuallySynced,
}: MonacoEditorProps) {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    // Need to keep a local copy so that as we are parsing/formatting JSON to save it
    //  the editor will not format and move the cursor around and will just keep
    //  displaying what the user has entered/edited
    const [localCopy, setLocalCopy] = useState('');
    const [showServerDiff, setShowServerDiff] = useState(false);

    const serverUpdate = useEditorStore_serverUpdate({
        localScope: localZustandScope,
    });
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    // TODO (editor store) Should just fetch these directly from the store?
    const catalogName = useMemo(
        () => currentCatalog?.catalog_name ?? null,
        [currentCatalog]
    );

    const catalogType = useMemo(
        () => currentCatalog?.spec_type,
        [currentCatalog]
    );

    // Snagging out the status of the editor
    const statuses = useEditorStore_statuses({
        localScope: localZustandScope,
    });
    const setStatus = useEditorStore_setStatus({
        localScope: localZustandScope,
    });

    const evaluatedPath = useMemo(
        () => path ?? catalogName ?? 'preset_path',
        [catalogName, path]
    );

    const status = useMemo(
        () =>
            Object.hasOwn(statuses, evaluatedPath)
                ? statuses[evaluatedPath]
                : EditorStatus.IDLE,
        [evaluatedPath, statuses]
    );

    const doneUpdatingValue = useCallback(
        (message: string, format: boolean) => {
            logRocketConsole(message);
            setStatus(EditorStatus.SAVED, evaluatedPath);

            if (format) {
                // Format the editor. Formatting like this should work like a standard IDE
                //  where your cursor position stays where it was and is moved with the new format
                void editorRef.current
                    ?.getAction('editor.action.formatDocument')
                    ?.run();
            }
        },
        [setStatus, evaluatedPath]
    );

    const updateValue = useCallback(
        (isUndo: boolean) => {
            // TODO (editor) need to get the status set before coming into this function so we can
            //   easily implement this. The one I found that didn't work like this is the collection schema editor.
            // if (!isUndo && status !== EditorStatus.EDITING) {
            //     logRocketConsole('editor:update:skipped', {
            //         status,
            //     });
            //     return;
            // }

            // Fetch the current value of the editor
            const currentValue = editorRef.current?.getValue();

            // Make sure we have a value and handled to call
            if (onChange && typeof currentValue === 'string') {
                setStatus(EditorStatus.EDITING, evaluatedPath);

                let processedVal;
                let validValue = true;

                if (defaultLanguage === 'json') {
                    // We save as JSON on the backend so need to make sure we can parse it
                    //  otherwise Postgres will not let us update the value

                    try {
                        processedVal = JSON.parse(currentValue);
                    } catch {
                        validValue = false;

                        setStatus(EditorStatus.INVALID, evaluatedPath);
                    }
                } else {
                    processedVal = currentValue;
                }

                // Make sure we have all the props needed to update the value
                if (validValue && catalogName && catalogType) {
                    setStatus(EditorStatus.SAVING, evaluatedPath);

                    // Check if there is a scope to update (ex: Schema editing for bindings editor)
                    if (editorSchemaScope) {
                        logRocketConsole('editor:update:saving:scoped', {
                            nestedProperty: editorSchemaScope,
                        });
                        onChange(
                            processedVal,
                            catalogName,
                            catalogType,
                            editorSchemaScope
                        )
                            .then(() => {
                                doneUpdatingValue(
                                    'editor:update:saving:scoped:success',
                                    !isUndo
                                );
                            })
                            .catch(() => {
                                logRocketConsole(
                                    'editor:update:saving:scoped:failed'
                                );
                                setStatus(
                                    EditorStatus.SAVE_FAILED,
                                    evaluatedPath
                                );
                            });
                    } else {
                        // Fire off the onChange to update the server
                        onChange(processedVal, catalogName, catalogType)
                            .then(() => {
                                doneUpdatingValue(
                                    'editor:update:saving:success',
                                    !isUndo
                                );
                            })
                            .catch(() => {
                                logRocketConsole('editor:update:saving:failed');
                                setStatus(
                                    EditorStatus.SAVE_FAILED,
                                    evaluatedPath
                                );
                            });
                    }
                } else {
                    logRocketConsole('editor:update:invalid', {
                        processedVal,
                        catalogName,
                        catalogType,
                    });
                    setStatus(EditorStatus.INVALID, evaluatedPath);
                }
            } else {
                logRocketConsole('editor:update:missing', {
                    onChange,
                    currentValue,
                });
            }
        },
        [
            catalogName,
            catalogType,
            defaultLanguage,
            doneUpdatingValue,
            editorSchemaScope,
            evaluatedPath,
            onChange,
            setStatus,
        ]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedChange = useCallback(debounce(updateValue, 750), [
        updateValue,
        catalogName,
    ]);
    useUnmount(() => {
        debouncedChange.cancel();
    });

    useEffect(() => {
        if (typeof defaultValue === 'string') setLocalCopy(defaultValue);
    }, [setLocalCopy, defaultValue]);

    // If we're syncing go ahead and put the status to idle so the
    //  editor kind of "resets"
    useEffect(() => {
        if (manuallySynced) {
            setStatus(EditorStatus.IDLE, evaluatedPath);
        }
    }, [evaluatedPath, setStatus, manuallySynced]);

    useEffect(() => {
        // This cancel exception is thrown but does not seem to cause any
        //  issues for users. I think we're safe to ignore this for now (Q4 2025)
        // https://github.com/microsoft/monaco-editor/issues/4389
        const handler = (event: any) => {
            if (ignorableEditorException(event)) {
                event.preventDefault();
            }

            logRocketEvent('MonacoEditor', {
                eventType: getEditorEventType(event),
                unhandledrejection: true,
            });
        };
        window.addEventListener('unhandledrejection', handler);
        return () => window.removeEventListener('unhandledrejection', handler);
    }, []);

    const handlers = {
        change: (value: any, ev: any) => {
            logRocketConsole('handlers:change', {
                status,
                ev,
            });

            // if the editor is disabled then don't handle the change. That way if
            //  we are syncing the edit with latest currentCatalog we don't accidently
            //  fire a change event.
            if (disabled || manuallySynced) {
                logRocketConsole('handlers:change:skipped', {
                    disabled,
                    syncing: manuallySynced,
                });

                // This is a really small edge case where a user has manually edited the spec, then clicked
                //  quickly a lot on the backfill button. This can make a state when the editor is firing on change
                //  because the value has been updated via the manual sync. So if that has happened we
                //  _should_ be safe resetting the status. Otherwise, the status might get stuck in a funky mode where
                //  it looks like it is trying to save.
                if (manuallySynced && status !== EditorStatus.IDLE) {
                    setStatus(EditorStatus.IDLE, evaluatedPath);
                }
                return;
            }

            // Safely grab if the user is undoing. That way we can skip the formatting
            // otherwise they might get stuck undoing the formatting.
            const undoing = ev?.isUndoing ?? false;

            // Set the status to editing
            if (status !== EditorStatus.EDITING) {
                setStatus(EditorStatus.EDITING, evaluatedPath);
            }

            // Update the local copy
            setLocalCopy(value);

            // Fire off the debounced change to keep the server up to date
            debouncedChange(undoing);
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            logRocketConsole('handlers:mount');
            editorRef.current = editor;
        },
        merge: () => {
            setShowServerDiff(!showServerDiff);
        },
    };

    if (catalogName && typeof defaultValue === 'string') {
        return (
            <Paper sx={{ width: '100%' }} variant="outlined">
                <Box
                    sx={{
                        ...editorToolBarSx,
                        minHeight: toolbarHeight,
                    }}
                >
                    <Typography sx={{ fontWeight: 500 }}>
                        {editorLabel}
                    </Typography>

                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{ justifyContent: 'end' }}
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
                        defaultLanguage={defaultLanguage}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        saveViewState={false}
                        defaultValue={defaultValue}
                        value={localCopy}
                        path={evaluatedPath}
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
