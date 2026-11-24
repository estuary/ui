import { Stack, Typography } from '@mui/material';

import { PrivateLinks } from 'src/components/admin/Settings/PrivateLinks';
import ExternalLink from 'src/components/shared/ExternalLink';
import { PublicDataPlanesTable } from 'src/components/tables/DataPlanes';
import { useTenantStore } from 'src/stores/Tenant';

const docsUrl = 'https://docs.estuary.dev/reference/allow-ip-addresses/';

export function DataPlanes() {
    const tenant = useTenantStore((state) => state.selectedTenant);

    return (
        <Stack spacing={2.5}>
            {tenant ? <PrivateLinks key={tenant} tenant={tenant} /> : null}

            <Stack component="section" spacing={1}>
                <Stack
                    direction="row"
                    useFlexGap
                    spacing={1}
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography
                        component="h3"
                        variant="subtitle1"
                        fontWeight={600}
                    >
                        Public data planes
                    </Typography>
                    <ExternalLink link={docsUrl} sx={{ ml: 0 }}>
                        IP allowlist guide
                    </ExternalLink>
                </Stack>
                {/* reset to first page when changing tenant */}
                <PublicDataPlanesTable key={tenant} tenant={tenant} />
            </Stack>
        </Stack>
    );
}
