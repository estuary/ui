import { Grid } from '@mui/material';

import Error from 'src/components/shared/Error';
import { useRefreshTokenStore } from 'src/components/admin/Api/RefreshToken/Store/create';


function RefreshTokenError() {
    const serverError = useRefreshTokenStore((state) => state.serverError);

    return serverError ? (
        <Grid item xs={12}>
            <Error severity="error" error={serverError} condensed />
        </Grid>
    ) : null;
}

export default RefreshTokenError;
