import type { ConfirmationAlertProps } from './types';
import { Typography } from '@mui/material';
import { useIntl } from 'react-intl';

function ConfirmationAlert({ messageId }: ConfirmationAlertProps) {
    const intl = useIntl();

    return (
        <Typography component="div">
            {intl.formatMessage({ id: messageId })}
        </Typography>
    );
}

export default ConfirmationAlert;
