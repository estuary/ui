import type { LogDialogContentProps } from 'src/components/shared/Entity/LogDialog/types';

import Logs from 'src/components/logs';
import EntityWarnings from 'src/components/shared/Entity/Warnings';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';

function LogDialogContent({
    spinnerMessageId,
    severity,
    token,
}: LogDialogContentProps) {
    return (
        <>
            <EntityWarnings />

            <ErrorBoundryWrapper>
                <Logs
                    token={token}
                    height={350}
                    loadingLineSeverity={severity}
                    spinnerMessages={
                        spinnerMessageId
                            ? {
                                  stoppedKey: spinnerMessageId,
                                  runningKey: spinnerMessageId,
                              }
                            : undefined
                    }
                />
            </ErrorBoundryWrapper>
        </>
    );
}

export default LogDialogContent;
