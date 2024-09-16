import { Button, DialogActions, Stack } from '@mui/material';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function Actions() {
    const [nextStep, previousStep] = usePreSavePromptStore((state) => [
        state.nextStep,
        state.previousStep,
    ]);

    const continueEnabled = usePreSavePromptStore((state) => {
        return state.steps?.[state.activeStep]?.state.valid;
    });

    console.log('continueEnabled', continueEnabled);

    return (
        <DialogActions>
            <Stack direction="row" spacing={2}>
                <Button onClick={previousStep} variant="text">
                    Back
                </Button>

                <Button
                    onClick={nextStep}
                    variant="outlined"
                    disabled={!continueEnabled}
                >
                    Continue
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
