import {
    Box,
    Button,
    DialogContent,
    Divider,
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
import { LoopIndexContextProvider } from 'context/LoopIndex';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import Logs from 'components/logs';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';
import CustomStepIcon from './CustomStepIcon';
import SkippedStepIcon from './SkippedStepIcon';

function Content() {
    const intl = useIntl();

    const [
        activeStep,
        steps,
        retryStep,
        dataFlowResetDraftId,
        dataFlowResetPudId,
    ] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.steps,
        state.retryStep,
        state.context.dataFlowResetDraftId,
        state.context.dataFlowResetPudId,
    ]);

    const renderedSteps = useMemo(
        () =>
            steps.map(
                (
                    {
                        allowRetry,
                        StepComponent,
                        stepLabelMessageId,
                        state: {
                            error,
                            progress,
                            publicationStatus,
                            optionalLabel,
                        },
                    },
                    index
                ) => {
                    let keyIncrementor = 0;
                    const getKey = () => `stepper-content__${keyIncrementor}`;
                    const hasError = Boolean(error);
                    const stepCanPublish = Boolean(publicationStatus);

                    const stepCompleted = progress >= ProgressFinished;
                    const stepFailed = progress === ProgressStates.FAILED;
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
                                            {stepCanPublish &&
                                            dataFlowResetDraftId ? (
                                                <>
                                                    <DraftErrors
                                                        draftId={
                                                            dataFlowResetDraftId
                                                        }
                                                        enablePolling={
                                                            stepFailed
                                                        }
                                                    />
                                                    <Divider />
                                                </>
                                            ) : null}

                                            <StepComponent key={getKey()} />

                                            <Stack spacing={2}>
                                                {stepFailed ? (
                                                    <Stack>
                                                        <Error
                                                            severity="error"
                                                            error={error}
                                                            condensed
                                                        />

                                                        {allowRetry ? (
                                                            <Button
                                                                onClick={() => {
                                                                    retryStep(
                                                                        index
                                                                    );

                                                                    keyIncrementor += 1;
                                                                }}
                                                            >
                                                                Retry
                                                            </Button>
                                                        ) : null}
                                                    </Stack>
                                                ) : null}

                                                {stepCanPublish &&
                                                (dataFlowResetPudId ||
                                                    stepFailed) ? (
                                                    <Box>
                                                        <Logs
                                                            token={
                                                                publicationStatus?.logs_token ??
                                                                null
                                                            }
                                                            height={350}
                                                            loadingLineSeverity={
                                                                stepFailed
                                                                    ? 'error'
                                                                    : 'success'
                                                            }
                                                            spinnerMessages={{
                                                                runningKey:
                                                                    'logs.default',
                                                                stoppedKey:
                                                                    progress ===
                                                                    ProgressStates.SUCCESS
                                                                        ? 'common.success'
                                                                        : 'logs.noLogs',
                                                            }}
                                                        />
                                                    </Box>
                                                ) : null}
                                            </Stack>
                                        </Stack>
                                    </LoopIndexContextProvider>
                                </ErrorBoundryWrapper>
                            </StepContent>
                        </Step>
                    );
                }
            ),
        [dataFlowResetDraftId, dataFlowResetPudId, intl, retryStep, steps]
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
