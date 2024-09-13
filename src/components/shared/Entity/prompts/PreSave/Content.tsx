import { DialogContent, Step, Stepper } from '@mui/material';
import { useMemo } from 'react';
import usePreSavePromptSteps from '../steps/preSave/usePreSavePromptSteps';

function Content() {
    const { activeStep, steps } = usePreSavePromptSteps();

    const renderedSteps = useMemo(
        () =>
            steps.map((StepComponent, index) => {
                return (
                    <Step key={`PreSave-step-${index}`}>
                        <StepComponent />
                    </Step>
                );
            }),
        [steps]
    );

    return (
        <DialogContent>
            <Stepper orientation="vertical" activeStep={activeStep}>
                {renderedSteps}
            </Stepper>
        </DialogContent>
    );
}

export default Content;
