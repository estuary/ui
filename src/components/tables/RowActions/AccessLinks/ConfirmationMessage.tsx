import { Typography } from '@mui/material';
import AlertBox from 'src/components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function ConfirmationMessage() {
    return (
        <AlertBox severity="warning" short>
            <Typography component="div">
                <FormattedMessage id="accessGrants.table.accessLinks.delete.confirm" />
            </Typography>
        </AlertBox>
    );
}

export default ConfirmationMessage;
