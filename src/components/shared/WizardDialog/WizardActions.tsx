import {
    Button,
    CircularProgress,
    DialogActions,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useWizard } from 'src/components/shared/WizardDialog/context';

function WizardActions() {
    const {
        isFirstStep,
        isLastStep,
        goToNext,
        goToPrevious,
        isNavigating,
        steps,
        currentStep,
        error,
    } = useWizard();

    const currentStepConfig = steps[currentStep];
    const showBackButton =
        !isFirstStep && currentStepConfig?.canRetreat !== false;
    const canProceed = currentStepConfig?.canProceed?.() ?? true;

    return (
        <DialogActions sx={{ p: 4, pt: 2 }}>
            {error ? (
                <Typography color="error" variant="body2" sx={{ mr: 'auto' }}>
                    {error}
                </Typography>
            ) : null}

            {showBackButton ? (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={goToPrevious}
                    disabled={isNavigating}
                >
                    <FormattedMessage id="cta.back" />
                </Button>
            ) : null}

            <Button
                variant="contained"
                size="small"
                onClick={goToNext}
                disabled={isNavigating || !canProceed}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {isNavigating ? (
                    <CircularProgress size={16} color="inherit" />
                ) : (
                    (currentStepConfig?.nextLabel ??
                    (isLastStep ? (
                        <FormattedMessage id="cta.save" />
                    ) : (
                        <FormattedMessage id="cta.next" />
                    )))
                )}
            </Button>
        </DialogActions>
    );
}

export default WizardActions;
