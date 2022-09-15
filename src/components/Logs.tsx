import Editor from '@monaco-editor/react';
import {
    Alert,
    Box,
    Button,
    Collapse,
    Stack,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { parse } from 'ansicolor';
import { useClient } from 'hooks/supabase-swr';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useInterval } from 'react-use';
import { DEFAULT_POLLING_INTERVAL, RPCS } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import SyncIcon from '@mui/icons-material/Sync';
import { LINK_BUTTON_STYLING } from 'context/Theme';

export interface LogProps {
    token: string | null;
    height?: number;
    defaultMessage?: string;
    disableIntervalFetching?: boolean;
    fetchAll?: boolean;
}

const MAX_EMPTY_CALLS = 120; // about two minutes
const NEW_LINE = '\r\n';

const generateLogLine = (logData: any) => {
    const parsedText = parse(logData.log_line);
    const mergedText = parsedText.spans
        .map((span) => {
            return span.text;
        })
        .join('');

    return mergedText;
};

const RESTART_MESSAGE_HEIGHT = 20;

function Logs({
    token,
    defaultMessage,
    height,
    disableIntervalFetching,
    fetchAll,
}: LogProps) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const supabaseClient = useClient();
    const intl = useIntl();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const [emptyResponses, setEmptyResponses] = useState(
        disableIntervalFetching ? MAX_EMPTY_CALLS : 0
    );

    const [networkFailure, setNetworkFailure] = useState<boolean>(false);
    const [offset, setOffset] = useState(0);
    const [logs, setLogs] = useState<string[]>([
        defaultMessage ??
            intl.formatMessage({
                id: 'logs.default',
            }),
    ]);

    const displayRestart =
        networkFailure ||
        (!disableIntervalFetching && MAX_EMPTY_CALLS < emptyResponses);

    const heightVal = (height ?? 200) + RESTART_MESSAGE_HEIGHT;

    const fetchLogs = async () => {
        const queryParams = {
            bearer_token: token,
        };
        if (fetchAll) {
            return supabaseClient.rpc(RPCS.VIEW_LOGS, queryParams);
        } else {
            return supabaseClient
                .rpc(RPCS.VIEW_LOGS, queryParams)
                .range(offset, offset + 10);
        }
    };

    const handlers = {
        change: () => {
            if (editorRef.current) {
                const lineCount =
                    editorRef.current.getModel()?.getLineCount() ?? 0;
                editorRef.current.revealLine(lineCount);
            }
        },
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
        reset: () => {
            setNetworkFailure(false);
            setEmptyResponses(0);
        },
    };

    useInterval(
        async () => {
            const fetchLogsResponse = await fetchLogs();

            if (fetchLogsResponse.error) {
                setNetworkFailure(true);
                setEmptyResponses(MAX_EMPTY_CALLS + 1);
            } else {
                setNetworkFailure(false);
                const { data: viewLogsResponse } = fetchLogsResponse;
                if (hasLength(viewLogsResponse)) {
                    const logsReduced = viewLogsResponse.map((logData) => {
                        return generateLogLine(logData);
                    });
                    setOffset(offset + viewLogsResponse.length);
                    setLogs(logs.concat(logsReduced));
                    if (disableIntervalFetching) {
                        setEmptyResponses(emptyResponses + 1);
                    }
                } else {
                    setEmptyResponses(emptyResponses + 1);
                }
            }
        },
        token && MAX_EMPTY_CALLS >= emptyResponses
            ? DEFAULT_POLLING_INTERVAL
            : null
    );

    // TODO: Use error color on the restart collapsible paper segment.

    return (
        <Box>
            <Box
                sx={{
                    minHeight: RESTART_MESSAGE_HEIGHT,
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Collapse in={displayRestart} sx={{ position: 'relative' }}>
                        <Stack direction="row">
                            <Alert severity="warning">
                                <FormattedMessage
                                    id={
                                        networkFailure
                                            ? 'logs.networkFailure'
                                            : 'logs.tooManyEmpty'
                                    }
                                    values={{
                                        restartCTA: (
                                            <Button
                                                variant="text"
                                                sx={LINK_BUTTON_STYLING}
                                                onClick={handlers.reset}
                                            >
                                                <FormattedMessage id="logs.restartLink" />
                                            </Button>
                                        ),
                                    }}
                                />
                            </Alert>
                        </Stack>
                    </Collapse>

                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'end',
                            alignItems: 'flex-start',
                        }}
                    >
                        {belowMd ? null : (
                            <Box>
                                <FormattedMessage
                                    id={
                                        displayRestart
                                            ? 'logs.paused'
                                            : 'logs.streaming'
                                    }
                                />
                            </Box>
                        )}

                        <Box>
                            {displayRestart ? (
                                <SyncDisabledIcon />
                            ) : (
                                <SyncIcon />
                            )}
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            <Editor
                height={`${heightVal}px`}
                defaultLanguage=""
                theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
                options={{
                    lineNumbers: 'off',
                    readOnly: true,
                    scrollBeyondLastLine: false,
                    minimap: {
                        enabled: false,
                    },
                }}
                onChange={handlers.change}
                onMount={handlers.mount}
                value={logs
                    .join(NEW_LINE)
                    .split(/\\n/)
                    .join(NEW_LINE)
                    .replaceAll(/\\"/g, '"')}
            />
        </Box>
    );
}

export default Logs;
