import { StepContent, StepLabel } from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import BindingReview from './BindingReview';

function SelectMaterialization() {
    return (
        <>
            <StepLabel>Select materialization for data flow reset</StepLabel>
            <StepContent>
                <ErrorBoundryWrapper>
                    <BindingReview />
                </ErrorBoundryWrapper>
            </StepContent>
        </>
    );
}

export default SelectMaterialization;
