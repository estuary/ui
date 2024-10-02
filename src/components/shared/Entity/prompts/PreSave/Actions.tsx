import { Button, DialogActions, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowSavePrompt } from 'stores/FormState/hooks';
import useEntityWorkflowHelpers from '../../hooks/useEntityWorkflowHelpers';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_done,
    usePreSavePromptStore_onFirstStep,
    usePreSavePromptStore_stepValid,
} from '../store/usePreSavePromptStore';

function Actions() {
    const intl = useIntl();

    const { exit } = useEntityWorkflowHelpers();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [nextStep, previousStep, disableBack] = usePreSavePromptStore(
        (state) => [
            state.nextStep,
            state.previousStep,
            state.context.disableBack,
        ]
    );

    const canContinue = usePreSavePromptStore_stepValid();
    const onFirstStep = usePreSavePromptStore_onFirstStep();
    const done = usePreSavePromptStore_done();

    return (
        <DialogActions sx={{ justifyContent: 'end' }}>
            {/*            <Box sx={{ pl: 5 }}>
                {done ? (
                    <AlertBox fitWidth short severity="success">
                        <Typography sx={{ mr: 1 }}>
                            {intl.formatMessage({
                                id: 'common.success',
                            })}
                        </Typography>
                    </AlertBox>
                ) : null}
            </Box>*/}

            <Stack direction="row" spacing={2}>
                <Button
                    disabled={disableBack}
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
                    onClick={() => (done ? exit() : nextStep())}
                    variant="outlined"
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
