import { AlertColor, Typography } from '@mui/material';
import Logs from 'components/logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    errored: boolean;
    saving: boolean;
    token: string;
}

const getMessageIdAndSeverity = (
    errored: boolean,
    saving: boolean
): [AlertColor | null, string] => {
    if (saving) {
        return [null, 'common.publishing'];
    }

    const messageId = errored ? 'common.fail' : 'common.success';
    const severity = errored ? 'error' : 'success';

    return [severity, messageId];
};

function RepublicationLogs({ errored, saving, token }: Props) {
    const [severity, messageId] = useMemo(
        () => getMessageIdAndSeverity(errored, saving),
        [errored, saving]
    );

    return (
        <>
            <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                <FormattedMessage id="storageMappings.dialog.generate.logsHeader" />
            </Typography>

            <ErrorBoundryWrapper>
                <Logs
                    token={token}
                    height={350}
                    loadingLineSeverity={severity}
                    spinnerMessages={
                        saving
                            ? {
                                  stoppedKey: messageId,
                                  runningKey: messageId,
                              }
                            : undefined
                    }
                />
            </ErrorBoundryWrapper>
        </>
    );
}

export default RepublicationLogs;
