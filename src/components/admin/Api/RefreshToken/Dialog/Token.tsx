import { Grid, Typography } from '@mui/material';

import { useRefreshTokenStore } from '../Store/create';
import { FormattedMessage } from 'react-intl';

import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';

function CopyRefreshToken() {
    const token = useRefreshTokenStore((state) => state.token);

    return token ? (
        <Grid item xs={12}>
            <AlertBox severity="info" short>
                <Typography sx={{ mb: 1 }}>
                    <FormattedMessage id="admin.cli_api.refreshToken.dialog.alert.copyToken" />
                </Typography>

                <SingleLineCode value={token} />
            </AlertBox>
        </Grid>
    ) : null;
}

export default CopyRefreshToken;
