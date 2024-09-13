import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import DiffViewer from './DiffViewer';

function ChangeReview() {
    return (
        <>
            <StepLabel>How the spec is changing</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    <DiffViewer />
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default ChangeReview;
