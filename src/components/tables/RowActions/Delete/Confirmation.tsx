import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

function DeleteConfirmation() {
    const intl = useIntl();

    return (
        <AlertBox severity="warning" short>
            <Typography component="div">
                {intl.formatMessage({ id: 'entityTable.delete.confirm' })}
            </Typography>
        </AlertBox>
    );
}

export default DeleteConfirmation;
