import { DialogTitle, IconButton, useTheme } from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useFormStateStore_setShowSavePrompt } from 'stores/FormState/hooks';
import useEntityWorkflowHelpers from '../../hooks/useEntityWorkflowHelpers';
import {
    usePreSavePromptStore,
    usePreSavePromptStore_done,
} from '../store/usePreSavePromptStore';

function Title() {
    const intl = useIntl();
    const theme = useTheme();

    const { exit } = useEntityWorkflowHelpers();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const done = usePreSavePromptStore_done();
    const [resetState, disableClose, dialogMessageId] = usePreSavePromptStore(
        (state) => [
            state.resetState,
            state.context.disableClose,
            state.context.dialogMessageId,
        ]
    );

    const cannotClose = Boolean(disableClose && !done);

    return (
        <DialogTitle
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            {intl.formatMessage({ id: dialogMessageId })}

            {cannotClose ? null : (
                <IconButton
                    disabled={Boolean(disableClose && !done)}
                    onClick={() => {
                        if (done) {
                            exit();
                            return;
                        }
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
            )}
        </DialogTitle>
    );
}

export default Title;
