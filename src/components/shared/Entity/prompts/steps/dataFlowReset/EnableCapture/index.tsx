import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

function EnableCapture() {
    return (
        <>
            <StepLabel>Enable capture</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>Logs</ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default EnableCapture;
