import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import { parse } from 'ansicolor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useInterval } from 'react-use';
import { DEFAULT_POLLING_INTERVAL, RPCS } from 'services/supabase';
import { useClient } from 'supabase-swr';

interface Props {
    token: string | null;
    height?: number;
    defaultMessage?: string;
}

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

function Logs({ token, defaultMessage, height }: Props) {
    const theme = useTheme();
    const supabaseClient = useClient();
    const intl = useIntl();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const [offset, setOffset] = useState(0);
    const [logs, setLogs] = useState<string[]>([
        defaultMessage ??
            intl.formatMessage({
                id: 'logs.default',
            }),
    ]);

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
    };

    useInterval(
        async () => {
            const { data: viewLogsResponse } = await supabaseClient
                .rpc(RPCS.VIEW_LOGS, {
                    bearer_token: token,
                })
                .range(offset, offset + 10);

            if (viewLogsResponse && viewLogsResponse.length > 0) {
                const logsReduced = viewLogsResponse.map((logData) => {
                    return generateLogLine(logData);
                });
                setOffset(offset + viewLogsResponse.length);
                setLogs(logs.concat(logsReduced));
            }
        },
        token ? DEFAULT_POLLING_INTERVAL : null
    );

    return (
        <Editor
            height={`${height ?? 200}px`}
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
    );
}

export default Logs;
