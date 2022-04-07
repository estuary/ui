import { useState } from 'react';
import { useIntl } from 'react-intl';
import { LazyLog } from 'react-lazylog';
import { useInterval } from 'react-use';
import { DEFAULT_INTERVAL, RPCS, supabase } from 'services/supabase';

interface Props {
    token: string | null;
    defaultMessage?: string;
}

const NEW_LINE = '\r\n';

function Logs(props: Props) {
    const { token, defaultMessage } = props;
    const intl = useIntl();

    const [offset, setOffset] = useState(0);
    const [logs, setLogs] = useState([
        defaultMessage ??
            intl.formatMessage({
                id: 'logs.default',
            }),
        '...',
    ]);

    useInterval(
        async () => {
            const { data: viewLogsResponse } = await supabase
                .rpc(RPCS.VIEW_LOGS, {
                    bearer_token: token,
                })
                .range(offset, offset + 10);

            if (viewLogsResponse && viewLogsResponse.length > 0) {
                const logsReduced = viewLogsResponse.map((logData) => {
                    return logData.log_line;
                });
                setOffset(offset + viewLogsResponse.length);
                setLogs(logs.concat(logsReduced));
            }
        },
        token ? DEFAULT_INTERVAL : null
    );

    return (
        <LazyLog
            extraLines={1}
            stream={true}
            text={logs
                .join(NEW_LINE)
                .split(/\\n/)
                .join(NEW_LINE)
                .replaceAll(/\\"/g, '"')}
            caseInsensitive
            enableSearch
            follow={true}
        />
    );
}

export default Logs;
