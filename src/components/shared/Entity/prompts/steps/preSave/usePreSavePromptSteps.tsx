import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { useMemo } from 'react';
import { createGlobalState } from 'react-use';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { DataFlowResetSteps } from '../dataFlowReset/shared';
import ChangeReviewStep from './ChangeReviewStep';
import PublishStep from './PublishStep';

// TODO (data flow reset) this stuff should go into a store
//  also we probably need to keep if a step is done within the step itself
//  that way a user could go back and view the outcome of a state while
//  other states are running.
export const useGlobalValue = createGlobalState<number>(0);

function usePreSavePromptSteps() {
    const [activeStep, setActiveStep] = useGlobalValue();

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const needsBackfilled = useBinding_backfilledBindings_count();

    const steps = useMemo(() => {
        const response: (() => ReactJSXElement)[] = [ChangeReviewStep];

        if (backfillDataflow && needsBackfilled) {
            response.push(...DataFlowResetSteps);
        }

        response.push(PublishStep);

        return response;
    }, [backfillDataflow, needsBackfilled]);

    return {
        steps,
        activeStep,
        setActiveStep,
        handleBack: () => {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        },
        handleNext: () => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        },
    };
}

export default usePreSavePromptSteps;
