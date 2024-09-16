import { DialogTitle, IconButton, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function Title() {
    const intl = useIntl();
    const theme = useTheme();

    const [activeStep, setActiveStep, setShow] = usePreSavePromptStore(
        (state) => [state.activeStep, state.setActiveStep, state.setShow]
    );

    const closeDialog = () => {
        setActiveStep(0);
        setShow(false);
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
