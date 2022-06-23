import { Alert, AlertTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';

function SelectorEmpty() {
    return (
        <Alert severity="info">
            <AlertTitle>No selection made</AlertTitle>
            <FormattedMessage id="entityCreate.bindingsConfig.noRows" />
        </Alert>
    );
}

export default SelectorEmpty;
