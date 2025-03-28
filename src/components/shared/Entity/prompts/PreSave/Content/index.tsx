import {
    DialogContent,
    Stack,
    Step,
    StepContent,
    Stepper,
} from '@mui/material';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { ProgressFinished } from 'src/components/tables/RowActions/Shared/types';
import { useMemo } from 'react';
import { LoopIndexContextProvider } from 'src/context/LoopIndex';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';
import StepDraftErrors from './StepDraftErrors';
import StepError from './StepError';
import StepLogs from './StepLogs';
import StepLabelAndIcon from './StepLabelAndIcon';

function Content() {
    const [activeStep, steps] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.steps,
    ]);

    const renderedSteps = useMemo(
        () =>
            steps.map(
                (
                    { StepComponent, stepLabelMessageId, state: { progress } },
                    index
                ) => {
                    return (
                        <Step
                            key={`PreSave-${stepLabelMessageId}-${index}`}
                            completed={progress >= ProgressFinished}
                        >
                            <LoopIndexContextProvider value={index}>
                                <StepLabelAndIcon />
                                <StepContent>
                                    <ErrorBoundryWrapper>
                                        <Stack spacing={2}>
                                            <StepDraftErrors />

                                            <StepComponent />

                                            <Stack spacing={2}>
                                                <StepError />

                                                <StepLogs />
                                            </Stack>
                                        </Stack>
                                    </ErrorBoundryWrapper>
                                </StepContent>
                            </LoopIndexContextProvider>
                        </Step>
                    );
                }
            ),
        [steps]
    );

    return (
        <DialogContent>
            <Stepper orientation="vertical" activeStep={activeStep} nonLinear>
                {renderedSteps}
            </Stepper>
        </DialogContent>
    );
}

export default Content;
