import { Grid } from '@mui/material';

import { useRefreshTokenStore } from '../Store/create';

import Error from 'src/components/shared/Error';

function RefreshTokenError() {
    const serverError = useRefreshTokenStore((state) => state.serverError);

    return serverError ? (
        <Grid item xs={12}>
            <Error severity="error" error={serverError} condensed />
        </Grid>
    ) : null;
}

export default RefreshTokenError;
