import { DialogContent } from '@mui/material';

import { useWizard } from 'src/components/shared/WizardDialog/context';

function WizardContent() {
    const { steps, currentStep } = useWizard();

    const currentStepConfig = steps[currentStep];

    if (!currentStepConfig) {
        return null;
    }

    return <DialogContent sx={{ p: 4 }}>{currentStepConfig.component}</DialogContent>;
}

export default WizardContent;
