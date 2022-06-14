import { Alert, Typography } from '@mui/material';
import { DisableEnableButtonProps } from 'components/tables/RowActions/DisableEnable/Button';
import { FormattedMessage } from 'react-intl';

function DisableEnableConfirmation({ enabling }: DisableEnableButtonProps) {
    return (
        <Alert variant="filled" severity="info">
            <Typography component="div">
                <FormattedMessage
                    id="capturesTable.disableEnable.confirm"
                    values={{
                        setting: (
                            <FormattedMessage
                                id={
                                    enabling
                                        ? 'common.enabled'
                                        : 'common.disabled'
                                }
                            />
                        ),
                    }}
                />
            </Typography>
        </Alert>
    );
}

export default DisableEnableConfirmation;
