import { Box } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import { AccessToken } from 'src/components/admin/Api/AccessToken';
import { RefreshToken } from 'src/components/admin/Api/RefreshToken';
import usePageTitle from 'src/hooks/usePageTitle';

export function PersonalTokens() {
    usePageTitle({
        header: authenticatedRoutes.settings.personalTokens.title,
    });

    return (
        <Box sx={{ pt: 2 }}>
            <RefreshToken />
            <AccessToken />
        </Box>
    );
}
