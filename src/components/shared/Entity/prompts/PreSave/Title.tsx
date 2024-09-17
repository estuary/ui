import { DialogTitle, IconButton, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowPreSavePrompt } from 'stores/FormState/hooks';
import usePreSavePromptSteps from '../steps/preSave/usePreSavePromptSteps';

function Title() {
    const intl = useIntl();
    const theme = useTheme();

    const { activeStep, setActiveStep } = usePreSavePromptSteps();
    const setShowPreSavePrompt = useFormStateStore_setShowPreSavePrompt();

    const closeDialog = () => {
        setActiveStep(0);
        setShowPreSavePrompt(false);
    };

    return (
        <DialogTitle
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            Please review your changes
            <IconButton disabled={activeStep > 2} onClick={closeDialog}>
                <Xmark
                    aria-label={intl.formatMessage({ id: 'cta.close' })}
                    style={{
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                    }}
                />
            </IconButton>
        </DialogTitle>
    );
}

export default Title;
