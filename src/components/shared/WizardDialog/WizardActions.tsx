import { Button, DialogActions } from '@mui/material';

import { useIntl } from 'react-intl';

import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { useWizard } from 'src/components/shared/WizardDialog/context';

// Renders Back/Next/Save buttons and error text for the current wizard step.
// Button visibility and labels adapt based on step position and per-step config.
export function WizardActions() {
    const intl = useIntl();

    const {
        isFirstStep,
        isLastStep,
        advance,
        retreat,
        isNavigating,
        steps,
        currentStep,
    } = useWizard();

    const currentStepConfig = steps[currentStep];
    const showBackButton = !isFirstStep;
    const canAdvance = currentStepConfig?.canAdvance?.() ?? true;

    return (
        <DialogActions sx={{ p: 3, pt: 1 }}>
            {showBackButton ? (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={retreat}
                    disabled={isNavigating}
                >
                    {intl.formatMessage({ id: 'cta.back' })}
                </Button>
            ) : null}

            <SafeLoadingButton
                variant="contained"
                size="small"
                onClick={advance}
                disabled={!canAdvance}
                loading={isNavigating}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {currentStepConfig?.nextLabel ??
                    (isLastStep
                        ? intl.formatMessage({ id: 'cta.save' })
                        : intl.formatMessage({ id: 'cta.next' }))}
            </SafeLoadingButton>
        </DialogActions>
    );
}
