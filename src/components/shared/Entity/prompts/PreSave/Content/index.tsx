import {
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
                        state: { error, progress, logsToken },
                    },
                    index
                ) => {
                    return (
                        <Step
                            key={`PreSave-step-${index}`}
                            completed={progress >= ProgressFinished}
                        >
                            <StepLabel error={Boolean(error)}>
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

                                        <Error
                                            severity="error"
                                            error={error}
                                            condensed
                                            hideTitle
                                        />

                                        <ErrorLogs
                                            defaultOpen
                                            logToken={
                                                Boolean(error)
                                                    ? logsToken
                                                    : null
                                            }
                                            logProps={{
                                                fetchAll: true,
                                            }}
                                        />

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
