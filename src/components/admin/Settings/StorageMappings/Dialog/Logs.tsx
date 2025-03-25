import type { AlertColor } from '@mui/material';
import { Typography } from '@mui/material';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import Logs from 'components/logs';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    errored: boolean;
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

function RepublicationLogs({ errored, token }: Props) {
    const saving = useStorageMappingStore((state) => state.saving);

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
                    spinnerMessages={{
                        stoppedKey: messageId,
                        runningKey: messageId,
                    }}
                />
            </ErrorBoundryWrapper>
        </>
    );
}

export default RepublicationLogs;
