import { Button, DialogActions, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_activeStepValid,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const [nextStep, previousStep] = usePreSavePromptStore((state) => [
        state.nextStep,
        state.previousStep,
    ]);

    const continueEnabled = usePreSavePromptStore_activeStepValid();

    return (
        <DialogActions>
            <Stack direction="row" spacing={2}>
                <Button onClick={previousStep} variant="text">
                    {intl.formatMessage({ id: 'cta.back' })}
                </Button>

                <Button
                    onClick={nextStep}
                    variant="outlined"
                    disabled={!continueEnabled}
                >
                    {intl.formatMessage({ id: 'cta.continue' })}
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
