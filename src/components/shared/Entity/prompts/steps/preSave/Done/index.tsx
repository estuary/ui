import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

function Done() {
    return (
        <>
            <StepLabel>Done</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    Congrats you are done!
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default Done;
