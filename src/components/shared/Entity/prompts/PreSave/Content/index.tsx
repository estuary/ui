import { useMemo } from 'react';

import {
    DialogContent,
    Stack,
    Step,
    StepContent,
    Stepper,
} from '@mui/material';

import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { ProgressFinished } from 'src/components/tables/RowActions/Shared/types';
import { LoopIndexContextProvider } from 'src/context/LoopIndex';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import StepDraftErrors from 'src/components/shared/Entity/prompts/PreSave/Content/StepDraftErrors';
import StepError from 'src/components/shared/Entity/prompts/PreSave/Content/StepError';
import StepLabelAndIcon from 'src/components/shared/Entity/prompts/PreSave/Content/StepLabelAndIcon';
import StepLogs from 'src/components/shared/Entity/prompts/PreSave/Content/StepLogs';


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
