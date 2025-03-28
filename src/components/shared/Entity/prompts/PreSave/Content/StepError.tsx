import { Button } from '@mui/material';
import { useIntl } from 'react-intl';
import Error from 'src/components/shared/Error';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

function StepError() {
    const intl = useIntl();

    const stepIndex = useLoopIndex();
    const [retryStep, stepFailed, error, allowRetry] = usePreSavePromptStore(
        (state) => {
            const currentState = state.steps[stepIndex].state;

            return [
                state.retryStep,
                currentState.progress === ProgressStates.FAILED,
                currentState.error,
                currentState.allowRetry,
            ];
        }
    );

    if (stepFailed) {
        return (
            <Error
                severity="error"
                error={error}
                condensed
                cta={
                    allowRetry ? (
                        <Button
                            size="small"
                            style={{
                                maxWidth: 'fit-content',
                            }}
                            onClick={() => retryStep(stepIndex)}
                        >
                            {intl.formatMessage({
                                id: 'cta.resetDataFlow.retry',
                            })}
                        </Button>
                    ) : null
                }
            />
        );
    }

    return null;
}

export default StepError;
