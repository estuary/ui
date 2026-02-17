import {
    Button,
    CircularProgress,
    DialogActions,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useWizard } from 'src/components/shared/WizardDialog/context';

// Renders Back/Next/Save buttons and error text for the current wizard step.
// Button visibility and labels adapt based on step position and per-step config.
export function WizardActions() {
    const {
        isFirstStep,
        isLastStep,
        advance,
        retreat,
        isNavigating,
        steps,
        currentStep,
        error,
    } = useWizard();

    const currentStepConfig = steps[currentStep];
    const showBackButton = !isFirstStep;
    const canAdvance = currentStepConfig?.canAdvance?.() ?? true;

    return (
        <DialogActions sx={{ p: 3, pt: 1 }}>
            {error ? (
                <Typography color="error" variant="body2" sx={{ mr: 'auto' }}>
                    {error}
                </Typography>
            ) : null}

            {showBackButton ? (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={retreat}
                    disabled={isNavigating}
                >
                    <FormattedMessage id="cta.back" />
                </Button>
            ) : null}

            <Button
                variant="contained"
                size="small"
                onClick={advance}
                disabled={isNavigating || !canAdvance}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {isNavigating ? (
                    <CircularProgress
                        size={16}
                        color="inherit"
                        // Adding vertical margin to prevent layout shift when spinner appears
                        sx={{ my: 0.5 }}
                    />
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
