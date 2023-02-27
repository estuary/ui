import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useEndpointConfigStore_errorsExist } from 'stores/EndpointConfig/hooks';

function EndpointConfigHeader() {
    const theme = useTheme();

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    return (
        <>
            {endpointConfigErrorsExist ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="entityCreate.endpointConfig.heading" />
            </Typography>
        </>
    );
}

export default EndpointConfigHeader;
