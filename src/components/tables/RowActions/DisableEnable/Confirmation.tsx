import { Typography } from '@mui/material';

import { DisableEnableButtonProps } from './types';
import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

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
