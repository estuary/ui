import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import type { ConfirmationAlertProps } from 'src/components/tables/RowActions/Shared/types';

function ConfirmationAlert({ messageId }: ConfirmationAlertProps) {
    const intl = useIntl();

    return (
        <Typography component="div">
            {intl.formatMessage({ id: messageId })}
        </Typography>
    );
}

export default ConfirmationAlert;
