import EntityWarnings from '../Warnings';
import { LogDialogContentProps } from './types';

import Logs from 'src/components/logs';
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
