import Editor from '@monaco-editor/react';
import { Alert, Box, Button, Collapse, Paper, useTheme } from '@mui/material';
import { parse } from 'ansicolor';
import { zIndexIncrement } from 'context/Theme';
import { useClient } from 'hooks/supabase-swr';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useInterval } from 'react-use';
import { DEFAULT_POLLING_INTERVAL, RPCS } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';

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

function Logs({
    token,
    defaultMessage,
    height,
    disableIntervalFetching,
    fetchAll,
}: LogProps) {
    const theme = useTheme();
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
    const heightVal = height ?? 200;

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
            <Collapse in={displayRestart} sx={{ position: 'relative' }}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'absolute',
                        zIndex: zIndexIncrement,
                        width: '100%',
                        justifyContent: 'space-between',
                        px: 1,
                    }}
                >
                    {networkFailure ? (
                        <Alert severity="warning">
                            <FormattedMessage id="logs.networkFailure" />
                        </Alert>
                    ) : (
                        <FormattedMessage id="logs.tooManyEmpty" />
                    )}

                    <Button
                        color="secondary"
                        variant="text"
                        onClick={handlers.reset}
                    >
                        <FormattedMessage id="cta.restart" />
                    </Button>
                </Paper>
            </Collapse>

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
