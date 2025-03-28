import { useMemo } from 'react';

import { AlertColor, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import Logs from 'src/components/logs';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';

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
