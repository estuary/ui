import { LinearProgress, StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

function WaitForCaptureStop() {
    return (
        <>
            <StepLabel>Wait for capture data to stop</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    <LinearProgress />
                    No logs... but show something
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default WaitForCaptureStop;
