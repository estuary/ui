import { Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { ConfirmationAlertProps } from './types';

function ConfirmationAlert({ messageId }: ConfirmationAlertProps) {
    const intl = useIntl();

    return (
        // <AlertBox severity="warning" short>
        <Typography component="div">
            {intl.formatMessage({ id: messageId })}
        </Typography>
        // </AlertBox>
    );
}

export default ConfirmationAlert;
