import { DialogTitle, IconButton, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowSavePrompt } from 'stores/FormState/hooks';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function Title() {
    const intl = useIntl();
    const theme = useTheme();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [activeStep, resetState] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.resetState,
    ]);

    return (
        <DialogTitle
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            Please review your changes
            <IconButton
                disabled={activeStep > 3}
                onClick={() => {
                    resetState();
                    setShowSavePrompt(false);
                }}
            >
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
