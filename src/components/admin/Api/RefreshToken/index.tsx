import { Typography } from '@mui/material';
import RefreshTokenTable from 'components/tables/RefreshTokens';
import { FormattedMessage } from 'react-intl';

function RefreshToken() {
    return (
        <>
            <Typography variant="h6" sx={{ m: 2 }}>
                <FormattedMessage id="admin.cli_api.refreshToken" />
            </Typography>

            <RefreshTokenTable />
        </>
    );
}

export default RefreshToken;
