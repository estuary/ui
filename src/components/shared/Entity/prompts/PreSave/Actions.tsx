import { Button, DialogActions, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_onFirstStep,
    usePreSavePromptStore_stepValid,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const [activeStep, nextStep, previousStep, setShow] = usePreSavePromptStore(
        (state) => [
            state.activeStep,
            state.nextStep,
            state.previousStep,
            state.setShow,
        ]
    );

    const canContinue = usePreSavePromptStore_stepValid;
    const onFirstStep = usePreSavePromptStore_onFirstStep();

    return (
        <DialogActions>
            <Stack direction="row" spacing={2}>
                <Button
                    disabled={activeStep > 2}
                    onClick={onFirstStep ? () => setShow(false) : previousStep}
                    variant="text"
                >
                    {intl.formatMessage({
                        id: onFirstStep ? 'cta.close' : 'cta.back',
                    })}
                </Button>

                <Button
                    onClick={nextStep}
                    variant="outlined"
                    disabled={!canContinue}
                >
                    {intl.formatMessage({ id: 'cta.continue' })}
                </Button>
            </Stack>
        </DialogActions>
    );
}

export default Actions;
