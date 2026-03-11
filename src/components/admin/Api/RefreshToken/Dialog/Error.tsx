import { Grid } from '@mui/material';

import { useRefreshTokenStore } from 'src/components/admin/Api/RefreshToken/Store/create';
import Error from 'src/components/shared/Error';

function RefreshTokenError() {
    const serverError = useRefreshTokenStore((state) => state.serverError);

    return serverError ? (
        <Grid size={{ xs: 12 }}>
            <Error severity="error" error={serverError} condensed />
        </Grid>
    ) : null;
}

export default RefreshTokenError;
