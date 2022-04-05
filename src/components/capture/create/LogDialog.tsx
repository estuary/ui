import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LazyLog } from 'react-lazylog';
import { useInterval } from 'react-use';
import { DEFAULT_INTERVAL, RPCS, supabase } from 'services/supabase';

interface Props {
    open: boolean;
    token: string | null;
    title: string;
    defaultMessage?: string;
    actionComponent: ReactNode;
}

function LogDialog(props: Props) {
    const { open, token, defaultMessage, actionComponent } = props;
    const intl = useIntl();

    const [offset, setOffset] = useState(0);
    const [logs, setLogs] = useState([
        defaultMessage ??
            intl.formatMessage({
                id: 'logs.default',
            }),
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
        <Dialog
            open={open}
            maxWidth="lg"
            fullWidth
            aria-labelledby="logs-dialog-title"
        >
            <DialogTitle id="logs-dialog-title">
                <FormattedMessage id="captureCreation.save.waitMessage" />
            </DialogTitle>
            <DialogContent
                sx={{
                    height: 300,
                }}
            >
                <LazyLog
                    extraLines={1}
                    stream={true}
                    text={logs.join('\r\n')}
                    caseInsensitive
                    enableSearch
                    follow={true}
                />
            </DialogContent>
            <DialogActions>{actionComponent}</DialogActions>
        </Dialog>
    );
}

export default LogDialog;
