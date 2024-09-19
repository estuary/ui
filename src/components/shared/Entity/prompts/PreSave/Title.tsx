import { DialogTitle, IconButton, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function Title() {
    const intl = useIntl();
    const theme = useTheme();

    const [activeStep, setShow] = usePreSavePromptStore((state) => [
        state.activeStep,
        state.setShow,
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
                    setShow(false);
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
