import { DialogContent, LinearProgress, Step, Stepper } from '@mui/material';
import { useMemo } from 'react';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function Content() {
    const [activeStep, steps] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.steps,
    ]);

    const renderedSteps = useMemo(
        () =>
            steps ? (
                steps.map(({ StepComponent }, index) => {
                    return (
                        <Step key={`PreSave-step-${index}`}>
                            <StepComponent />
                        </Step>
                    );
                })
            ) : (
                <LinearProgress />
            ),
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
