import { Alert, AlertTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';

function DeleteConfirmation() {
    return (
        <Alert variant="filled" severity="warning">
            <AlertTitle>
                <FormattedMessage id="common.noUnDo" />
            </AlertTitle>
            <FormattedMessage id="capturesTable.delete.confirm" />
        </Alert>
    );
}

export default DeleteConfirmation;
