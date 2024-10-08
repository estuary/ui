import { Button, DialogActions, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowSavePrompt } from 'stores/FormState/hooks';
import useEntityWorkflowHelpers from '../../hooks/useEntityWorkflowHelpers';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_done,
    usePreSavePromptStore_onFirstStep,
    usePreSavePromptStore_onLastStep,
    usePreSavePromptStore_stepValid,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const { exit } = useEntityWorkflowHelpers();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [nextStep, previousStep, disableBack, disableClose] =
        usePreSavePromptStore((state) => [
            state.nextStep,
            state.previousStep,
            state.context.disableBack,
            state.context.disableClose,
        ]);

    const canContinue = usePreSavePromptStore_stepValid();
    const onFirstStep = usePreSavePromptStore_onFirstStep();
    const onLastStep = usePreSavePromptStore_onLastStep();
    const done = usePreSavePromptStore_done();

    return (
        <DialogActions sx={{ justifyContent: 'end' }}>
            <Stack direction="row" spacing={2}>
                <Button
                    disabled={
                        onLastStep
                            ? true
                            : onFirstStep
                            ? disableClose
                            : disableBack
                    }
                    onClick={
                        onFirstStep
                            ? () => setShowSavePrompt(false)
                            : previousStep
                    }
                    variant="outlined"
                >
                    {intl.formatMessage({
                        id: onFirstStep ? 'cta.close' : 'cta.back',
                    })}
                </Button>

                <Button
                    onClick={() => (done ? exit() : nextStep())}
                    disabled={!canContinue}
                >
                    {intl.formatMessage({
                        id: done ? 'cta.goToDetails' : 'cta.continue',
                    })}
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
