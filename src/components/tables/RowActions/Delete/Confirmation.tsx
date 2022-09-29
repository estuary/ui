import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function DeleteConfirmation() {
    return (
        <AlertBox
            severity="warning"
            title={
                <Typography component="div">
                    <FormattedMessage id="common.noUnDo" />
                </Typography>
            }
        >
            <Typography component="div">
                <FormattedMessage id="capturesTable.delete.confirm" />
            </Typography>
        </AlertBox>
    );
}

export default DeleteConfirmation;
