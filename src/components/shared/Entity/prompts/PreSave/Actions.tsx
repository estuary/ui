import { Button, DialogActions, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_activeStep,
    usePreSavePromptStore_onFirstStep,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const [nextStep, previousStep] = usePreSavePromptStore((state) => [
        state.nextStep,
        state.previousStep,
    ]);

    const activeStep = usePreSavePromptStore_activeStep();
    const onFirstStep = usePreSavePromptStore_onFirstStep();

    return (
        <DialogActions>
            <Stack direction="row" spacing={2}>
                <Button
                    onClick={previousStep}
                    variant="text"
                    disabled={onFirstStep}
                >
                    {intl.formatMessage({ id: 'cta.back' })}
                </Button>

                <Button
                    onClick={nextStep}
                    variant="outlined"
                    disabled={!Boolean(activeStep?.valid)}
                >
                    {intl.formatMessage({ id: 'cta.continue' })}
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
