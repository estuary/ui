import Editor, { DiffEditor } from '@monaco-editor/react';
import {
    Box,
    Divider,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import Invalid from 'components/editor/Status/Invalid';
import ServerDiff from 'components/editor/Status/ServerDiff';
import Synchronized from 'components/editor/Status/Synchronized';
import Synchronizing from 'components/editor/Status/Synchronizing';
import {
    useEditorStore_serverUpdate,
    useEditorStore_setStatus,
    useEditorStore_status,
} from 'components/editor/Store/hooks';
import { EditorStatus } from 'components/editor/Store/types';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    useTransformationCreate_attributeType,
    useTransformationCreate_catalogUpdating,
    useTransformationCreate_patchSelectedAttribute,
    useTransformationCreate_selectedAttribute,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    ICON_SIZE,
} from 'utils/editor-utils';

type onChange = (value: any, attributeId: string) => any;

export interface MonacoEditorProps {
    localZustandScope: boolean;
    defaultSQL: string;
    disabled?: boolean;
    onChange?: onChange;
    height?: number;
    toolbarHeight?: number;
}

function MonacoEditor({
    localZustandScope,
    defaultSQL,
    disabled,
    height = DEFAULT_HEIGHT,
    onChange,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: MonacoEditorProps) {
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    // Draft Editor Store
    const serverUpdate = useEditorStore_serverUpdate({
        localScope: localZustandScope,
    });

    const status = useEditorStore_status({ localScope: localZustandScope });
    const setStatus = useEditorStore_setStatus({
        localScope: localZustandScope,
    });

    // Transformation Create Store
    const catalogUpdating = useTransformationCreate_catalogUpdating();
    const transformConfigs = useTransformationCreate_transformConfigs();

    const attributeType = useTransformationCreate_attributeType();
    const attributeId = useTransformationCreate_selectedAttribute();
    const patchSelectedAttribute =
        useTransformationCreate_patchSelectedAttribute();

    const [showServerDiff, setShowServerDiff] = useState(false);

    const updateValue = () => {
        console.log('editor:update');
        const currentValue = editorRef.current
            ?.getValue()
            .replaceAll(/[\t\r\n]|(\s{2,})/g, ' ');

        console.log('editor:update:current', {
            currentValue,
        });
        if (onChange && typeof currentValue === 'string') {
            setStatus(EditorStatus.EDITING);

            if (attributeId) {
                console.log('editor:update:saving', {
                    currentValue,
                    attributeId,
                });
                setStatus(EditorStatus.SAVING);

                onChange(currentValue, attributeId)
                    .then(() => {
                        patchSelectedAttribute(currentValue);

                        console.log('editor:update:saving:success');
                        setStatus(EditorStatus.SAVED);
                    })
                    .catch(() => {
                        console.log('editor:update:saving:failed');
                        setStatus(EditorStatus.SAVE_FAILED);
                    });
            } else {
                console.log('editor:update:invalid', {
                    currentValue,
                    attributeId,
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
        attributeId,
    ]);

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

    const filename = useMemo(
        () =>
            attributeType === 'transform' && !catalogUpdating
                ? transformConfigs[attributeId].filename
                : attributeId,
        [attributeId, attributeType, catalogUpdating, transformConfigs]
    );

    if (attributeId) {
        return (
            <Paper sx={{ width: '100%', boxShadow: 'unset' }}>
                <Box
                    sx={{
                        minHeight: toolbarHeight,
                        p: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography sx={{ fontWeight: 500 }}>{filename}</Typography>

                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{ justifyContent: 'end', alignItems: 'center' }}
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
                        modified={serverUpdate}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                    />
                ) : (
                    <Editor
                        height={`${height}px`}
                        defaultLanguage="sql"
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        saveViewState={false}
                        defaultValue={defaultSQL}
                        value={defaultSQL}
                        path={attributeId}
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
