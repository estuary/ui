import { Alert, AlertTitle, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

function DeleteConfirmation() {
    return (
        <Alert variant="filled" severity="warning">
            <AlertTitle>
                <Typography component="div">
                    <FormattedMessage id="common.noUnDo" />
                </Typography>
            </AlertTitle>
            <Typography component="div">
                <FormattedMessage id="capturesTable.delete.confirm" />
            </Typography>
        </Alert>
    );
}

export default DeleteConfirmation;
