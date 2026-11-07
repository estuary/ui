import { Box, Divider, Stack, Typography } from '@mui/material';

import { SemanticBranch, useSemanticLeaf } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import ExternalLink from 'src/components/shared/ExternalLink';
import AccessGrantsTable from 'src/components/tables/AccessGrants';
import usePageTitle from 'src/hooks/usePageTitle';

function AccessGrants() {
    const { ref: semanticAuthorizationSettingsRef } =
        useSemanticLeaf<HTMLAnchorElement>('Authorization Settings');

    usePageTitle({
        header: authenticatedRoutes.admin.accessGrants.title,
        headerLink: 'https://docs.estuary.dev/reference/authentication/',
    });

    return (
        <SemanticBranch label="Admin">
            <SemanticBranch label="Access Grants">
                <SemanticBranch label="Navigation">
                    <AdminTabs />
                </SemanticBranch>

                <Stack spacing={2} sx={{ my: 2 }}>
                    <Box>
                        <Typography
                            component="div"
                            variant="h6"
                            sx={{ mb: 0.5 }}
                        >
                            Access Grants
                        </Typography>

                        <Box>
                            These are all the Access Grants that are currently
                            provisioned. An administrator can update them in the{' '}
                            <ExternalLink
                                linkRef={semanticAuthorizationSettingsRef}
                                link="https://go.estuary.dev/provision"
                            >
                                authorization settings
                            </ExternalLink>
                            .
                        </Box>
                    </Box>

                    <Divider />
                </Stack>

                <SemanticBranch label="User Grants">
                    <AccessGrantsTable tablePrefix="ag" showUser />
                </SemanticBranch>

                <SemanticBranch label="Role Grants">
                    <AccessGrantsTable tablePrefix="pr" />
                </SemanticBranch>
            </SemanticBranch>
        </SemanticBranch>
    );
}

export default AccessGrants;
