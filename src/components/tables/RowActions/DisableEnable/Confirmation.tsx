import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { DisableEnableButtonProps } from 'components/tables/RowActions/DisableEnable/Button';
import { FormattedMessage } from 'react-intl';

function DisableEnableConfirmation({ enabling }: DisableEnableButtonProps) {
    return (
        <AlertBox severity="info" short>
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
        </AlertBox>
    );
}

export default DisableEnableConfirmation;
