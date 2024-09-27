import { Box, Button, DialogActions, Stack, Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowSavePrompt } from 'stores/FormState/hooks';
import useEntityWorkflowHelpers from '../../hooks/useEntityWorkflowHelpers';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_onFirstStep,
    usePreSavePromptStore_onLastStep,
    usePreSavePromptStore_stepValid,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const { exit } = useEntityWorkflowHelpers();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [activeStep, nextStep, previousStep] = usePreSavePromptStore(
        (state) => [state.activeStep, state.nextStep, state.previousStep]
    );

    const canContinue = usePreSavePromptStore_stepValid();
    const onFirstStep = usePreSavePromptStore_onFirstStep();
    const onLastStep = usePreSavePromptStore_onLastStep();

    return (
        <DialogActions style={{ justifyContent: 'space-between' }}>
            <Box>
                {onLastStep && canContinue ? (
                    <AlertBox fitWidth short severity="success">
                        <Typography sx={{ mr: 1 }}>
                            {intl.formatMessage({
                                id: 'common.success',
                            })}
                        </Typography>
                    </AlertBox>
                ) : null}
            </Box>

            <Stack direction="row" spacing={2}>
                <Button
                    disabled={activeStep > 3}
                    onClick={
                        onFirstStep
                            ? () => setShowSavePrompt(false)
                            : previousStep
                    }
                    variant="text"
                >
                    {intl.formatMessage({
                        id: onFirstStep ? 'cta.close' : 'cta.back',
                    })}
                </Button>

                <Button
                    onClick={() => (onLastStep ? exit() : nextStep())}
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
