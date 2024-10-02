import {
    Box,
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

function Content() {
    const intl = useIntl();

    const [activeStep, steps, dataFlowResetDraftId, dataFlowResetPudId] =
        usePreSavePromptStore((state) => [
            state.activeStep,
            state.steps,
            state.context.dataFlowResetDraftId,
            state.context.dataFlowResetPudId,
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
                    const stepCanPublish = Boolean(publicationStatus);

                    console.log('stepCanPublish', stepCanPublish);
                    console.log('dataFlowResetPudId', dataFlowResetPudId);
                    console.log('publicationStatus', publicationStatus);

                    return (
                        <Step
                            key={`PreSave-${stepLabelMessageId}-${index}`}
                            completed={stepCompleted}
                        >
                            <StepLabel
                                error={hasError}
                                StepIconComponent={
                                    progress === ProgressStates.IDLE
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
                                                            progress ===
                                                            ProgressStates.FAILED
                                                        }
                                                    />
                                                    <Divider />
                                                </>
                                            ) : null}

                                            <StepComponent />

                                            <Stack spacing={2}>
                                                {progress ===
                                                ProgressStates.FAILED ? (
                                                    <Error
                                                        severity="error"
                                                        error={error}
                                                        condensed
                                                    />
                                                ) : null}

                                                {stepCanPublish &&
                                                (dataFlowResetPudId ||
                                                    progress ===
                                                        ProgressStates.FAILED) ? (
                                                    <Box>
                                                        <Logs
                                                            token={
                                                                publicationStatus?.logs_token ??
                                                                null
                                                            }
                                                            height={350}
                                                            loadingLineSeverity={
                                                                progress ===
                                                                ProgressStates.FAILED
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
        [dataFlowResetDraftId, dataFlowResetPudId, intl, steps]
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
