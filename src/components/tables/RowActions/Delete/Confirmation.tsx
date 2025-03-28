import { Typography } from '@mui/material';
import AlertBox from 'src/components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

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
