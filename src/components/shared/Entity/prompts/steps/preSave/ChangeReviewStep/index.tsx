import { StepContent, StepLabel } from '@mui/material';
import DiffViewer from './DiffViewer';

function ChangeReview() {
    return (
        <>
            <StepLabel>How the spec is changing</StepLabel>
            <StepContent>
                <DiffViewer />
            </StepContent>
        </>
    );
}

export default ChangeReview;
