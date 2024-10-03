import {
    DialogContent,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
} from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import {
    ProgressFinished,
    ProgressStates,
} from 'components/tables/RowActions/Shared/types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { LoopIndexContextProvider } from 'context/LoopIndex';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';
import StepError from '../../steps/dataFlowReset/DisableCapture/StepError';
import StepDraftErrors from '../../steps/dataFlowReset/DisableCapture/StepDraftErrors';
import StepLogs from '../../steps/dataFlowReset/DisableCapture/StepLogs';
import CustomStepIcon from './CustomStepIcon';
import SkippedStepIcon from './SkippedStepIcon';

function Content() {
    const intl = useIntl();

    const [activeStep, steps] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.steps,
    ]);

    const renderedSteps = useMemo(
        () =>
            steps.map(
                (
                    {
                        StepComponent,
                        stepLabelMessageId,
                        state: { error, progress, optionalLabel },
                    },
                    index
                ) => {
                    const hasError = Boolean(error);

                    const stepCompleted = progress >= ProgressFinished;
                    const stepSkipped = progress === ProgressStates.SKIPPED;

                    return (
                        <Step
                            key={`PreSave-${stepLabelMessageId}-${index}`}
                            completed={stepCompleted}
                        >
                            <StepLabel
                                error={hasError}
                                optional={
                                    optionalLabel
                                        ? optionalLabel
                                        : stepSkipped
                                        ? intl.formatMessage({
                                              id: 'common.skipped',
                                          })
                                        : undefined
                                }
                                StepIconComponent={
                                    stepSkipped
                                        ? SkippedStepIcon
                                        : progress === ProgressStates.IDLE
                                        ? undefined
                                        : CustomStepIcon
                                }
                            >
                                {intl.formatMessage({
                                    id: stepLabelMessageId,
                                })}
                            </StepLabel>
                            <StepContent>
                                <ErrorBoundryWrapper>
                                    <LoopIndexContextProvider value={index}>
                                        <Stack spacing={2}>
                                            <StepDraftErrors />

                                            <StepComponent />

                                            <Stack spacing={2}>
                                                <StepError />

                                                <StepLogs />
                                            </Stack>
                                        </Stack>
                                    </LoopIndexContextProvider>
                                </ErrorBoundryWrapper>
                            </StepContent>
                        </Step>
                    );
                }
            ),
        [intl, steps]
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
