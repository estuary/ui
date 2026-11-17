import type { ConfirmationAlertProps } from 'src/components/tables/RowActions/Shared/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

function ConfirmationAlert({
    message,
}: Omit<ConfirmationAlertProps, 'messageId'> & { message: string }) {
    return <Typography component="div">{message}</Typography>;
}

/** @deprecated Prefer the named `ConfirmationAlert` export */
function ConfirmationAlertWrapper({ messageId }: ConfirmationAlertProps) {
    const intl = useIntl();

    return (
        <ConfirmationAlert message={intl.formatMessage({ id: messageId })} />
    );
}

export default ConfirmationAlertWrapper;
