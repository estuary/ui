import {
    Box,
    DialogContent,
    LinearProgress,
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
import Error from 'components/shared/Error';
import ErrorLogs from 'components/shared/Entity/Error/Logs';
import { LoopIndexContextProvider } from 'context/LoopIndex';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

function Content() {
    const intl = useIntl();
    const [activeStep, steps, backfilledDraftId] = usePreSavePromptStore(
        (state) => [
            state.activeStep,
            state.steps,
            state.context?.backfilledDraftId,
        ]
    );

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
                            <StepLabel error={hasError}>
                                {intl.formatMessage({
                                    id: stepLabelMessageId,
                                })}
                            </StepLabel>
                            <StepContent>
                                <ErrorBoundryWrapper>
                                    <LoopIndexContextProvider value={index}>
                                        <Stack>
                                            {progress ===
                                            ProgressStates.RUNNING ? (
                                                <LinearProgress />
                                            ) : null}

                                            {backfilledDraftId ? (
                                                <DraftErrors
                                                    draftId={backfilledDraftId}
                                                />
                                            ) : null}
                                            {/* TODO (data flow reset)
                                                <AlertBox
                                                    short
                                                    hideIcon
                                                    severity="error"
                                                    title={intl.formatMessage({
                                                        id: 'preSavePrompt.draftErrors.title',
                                                    })}
                                                >
                                                    <Typography>
                                                        {intl.formatMessage({
                                                            id: 'preSavePrompt.draftErrors.message',
                                                        })}
                                                    </Typography>

                                                    <DraftErrors
                                                        draftId={
                                                            backfilledDraftId
                                                        }
                                                    />
                                                </AlertBox>
                                            */}

                                            {progress ===
                                            ProgressStates.FAILED ? (
                                                <Stack>
                                                    <Error
                                                        severity="error"
                                                        error={error}
                                                        condensed
                                                    />
                                                    <Box>
                                                        <ErrorLogs
                                                            logToken={
                                                                hasError
                                                                    ? publicationStatus?.logs_token
                                                                    : null
                                                            }
                                                            logProps={{
                                                                spinnerMessages:
                                                                    {
                                                                        runningKey:
                                                                            'logs.default',
                                                                        stoppedKey:
                                                                            'logs.noLogs',
                                                                    },
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            ) : null}
                                        </Stack>

                                        <StepComponent />
                                    </LoopIndexContextProvider>
                                </ErrorBoundryWrapper>
                            </StepContent>
                        </Step>
                    );
                }
            ),
        [backfilledDraftId, intl, steps]
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
