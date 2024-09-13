import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import Logs from 'components/logs';

function DisableCapture() {
    return (
        <>
            <StepLabel>Disable capture</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    <Logs
                        token={null}
                        height={350}
                        loadingLineSeverity="info"
                        spinnerMessages={{
                            stoppedKey: 'dataflowReset.logs.spinner.stopped',
                            runningKey: 'dataflowReset.logs.spinner.running',
                        }}
                    />
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default DisableCapture;
