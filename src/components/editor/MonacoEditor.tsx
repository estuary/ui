import Editor from '@monaco-editor/react';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { Box, Divider, Paper, Stack, useTheme } from '@mui/material';
import { debounce } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export interface Props {
    disabled?: boolean;
    value: any;
    path: string;
    onChange?: (newVal: any, path: string) => any;
    height?: number;
}

const DEFAULT_HEIGHT = 350;

function MonacoEditor({ disabled, value, path, height, onChange }: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    const heightVal = height ?? DEFAULT_HEIGHT;
    const [isChanging, setIsChanging] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const bar = useCallback(
        debounce((val: string | undefined) => {
            console.log('debounce on change');
            if (val && editorRef.current && onChange) {
                setIsChanging(true);
                onChange(JSON.parse(val), path)
                    .then(() => {
                        console.log('then');
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
            console.log('on change');

            setIsChanging(true);
            bar(val);
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
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
                        {isChanging ? (
                            <>
                                <FormattedMessage id="common.saving" />
                                <CloudSyncIcon sx={{ fontSize: 15 }} />
                            </>
                        ) : (
                            <>
                                <FormattedMessage id="common.saved" />
                                <CloudDoneIcon sx={{ fontSize: 15 }} />
                            </>
                        )}
                    </Stack>
                </Box>
                <Divider />
                <Editor
                    height={`${heightVal}px`}
                    defaultLanguage="json"
                    theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
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
            </Paper>
        );
    } else {
        return null;
    }
}

export default MonacoEditor;
