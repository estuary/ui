import { Button, DialogActions, Stack } from '@mui/material';
import usePreSavePromptSteps from '../steps/preSave/usePreSavePromptSteps';

function Actions() {
    const { handleBack, handleNext } = usePreSavePromptSteps();

    return (
        <DialogActions>
            <Stack direction="row" spacing={2}>
                <Button onClick={handleBack} variant="text">
                    Back
                </Button>

                <Button onClick={handleNext} variant="outlined">
                    Continue
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
