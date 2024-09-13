import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

function MarkMaterialization() {
    return (
        <>
            <StepLabel>Mark materialization notBefore</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    describe what we're doing
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default MarkMaterialization;
