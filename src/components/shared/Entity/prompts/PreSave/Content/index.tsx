import {
    Box,
    DialogContent,
    LinearProgress,
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
import Error from 'components/shared/Error';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import { LoopIndexContextProvider } from 'context/LoopIndex';
import { XmarkCircle } from 'iconoir-react';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

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
                        state: { error, progress, publicationStatus },
                    },
                    index
                ) => {
                    const hasError = Boolean(error);
                    const stepCompleted = progress >= ProgressFinished;

                    return (
                        <Step
                            key={`PreSave-step-${stepLabelMessageId}-${index}`}
                            completed={stepCompleted}
                        >
                            <StepLabel
                                error={hasError}
                                StepIconProps={
                                    hasError
                                        ? {
                                              icon: <XmarkCircle />,
                                          }
                                        : undefined
                                }
                            >
                                {intl.formatMessage({
                                    id: stepLabelMessageId,
                                })}
                            </StepLabel>
                            <StepContent>
                                <ErrorBoundryWrapper>
                                    <LoopIndexContextProvider value={index}>
                                        {progress === ProgressStates.RUNNING ? (
                                            <LinearProgress />
                                        ) : null}

                                        {progress === ProgressStates.FAILED ? (
                                            <>
                                                <Error
                                                    severity="error"
                                                    error={error}
                                                    condensed
                                                    hideTitle
                                                />
                                                <Box>
                                                    <ErrorLogs
                                                        defaultOpen
                                                        logToken={
                                                            hasError
                                                                ? publicationStatus?.logs_token
                                                                : null
                                                        }
                                                        logProps={{
                                                            fetchAll: true,
                                                            spinnerMessages: {
                                                                runningKey:
                                                                    'logs.default',
                                                                stoppedKey:
                                                                    'logs.noLogs',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </>
                                        ) : null}

                                        <StepComponent />
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
