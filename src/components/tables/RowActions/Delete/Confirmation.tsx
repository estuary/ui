import { Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

function DeleteConfirmation() {
    return (
        <AlertBox severity="warning" short>
            <Typography component="div">
                <FormattedMessage id="entityTable.delete.confirm" />
            </Typography>
        </AlertBox>
    );
}

export default DeleteConfirmation;
