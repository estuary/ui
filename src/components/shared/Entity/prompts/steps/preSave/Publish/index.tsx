import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

function Publish() {
    return (
        <>
            <StepLabel>Publishing</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>Logs</ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default Publish;
