import { Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { ConfirmationAlertProps } from './types';

function ConfirmationAlert({ messageId }: ConfirmationAlertProps) {
    const intl = useIntl();

    return (
        <Typography component="div">
            {intl.formatMessage({ id: messageId })}
        </Typography>
    );
}

export default ConfirmationAlert;
