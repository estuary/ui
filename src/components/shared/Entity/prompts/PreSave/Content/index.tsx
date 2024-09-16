import {
    DialogContent,
    LinearProgress,
    Step,
    StepContent,
    StepLabel,
    Stepper,
} from '@mui/material';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

function Content() {
    const intl = useIntl();
    const [activeStep, steps] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.steps,
    ]);

    const renderedSteps = useMemo(
        () =>
            steps ? (
                steps.map((step, index) => {
                    const { StepComponent, stepLabelMessageId, state } = step;
                    return (
                        <Step key={`PreSave-step-${index}`}>
                            <StepLabel>
                                {intl.formatMessage({ id: stepLabelMessageId })}
                            </StepLabel>
                            <StepContent>
                                <ErrorBoundryWrapper>
                                    {state.running ? <LinearProgress /> : null}
                                    <StepComponent />
                                </ErrorBoundryWrapper>
                            </StepContent>
                        </Step>
                    );
                })
            ) : (
                <LinearProgress />
            ),
        [intl, steps]
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
