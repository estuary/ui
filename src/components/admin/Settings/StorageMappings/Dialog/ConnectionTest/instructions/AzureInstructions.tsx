import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import { Box, Link, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

export function AzureInstructions({ connection }: { connection: Connection }) {
    const intl = useIntl();
    const { storageAccountName, accountTenantId } = connection.store;
    const { azureApplicationClientId, azureApplicationName } =
        connection.dataPlane;

    const adminConsentUrl = `https://login.microsoftonline.com/${accountTenantId}/v2.0/adminconsent?client_id=${azureApplicationClientId}&scope=https://storage.azure.com/.default`;

    return (
        <Stack spacing={2}>
            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step1.title',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step1.prompt',
                })}
                <Link
                    href="https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal#create-a-container"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.instructions.azure.step1.link',
                    })}
                </Link>
            </Typography>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step2.title',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step2.description',
                })}
            </Typography>

            <Typography>
                <Link
                    href={adminConsentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.instructions.azure.step2.link',
                    })}
                </Link>
            </Typography>

            <Typography variant="h6" fontSize={18} fontWeight={700}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step3.title',
                })}
            </Typography>

            <Box component="ol" sx={{ my: 0, pl: 4 }}>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage(
                            {
                                id: 'storageMappings.dialog.instructions.azure.step3.navigateToAccount',
                            },
                            { storageAccountName }
                        )}
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.instructions.azure.step3.openIam',
                        })}
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.instructions.azure.step3.addRole',
                        })}
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.instructions.azure.step3.selectRole',
                        })}
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage(
                            {
                                id: 'storageMappings.dialog.instructions.azure.step3.selectMember',
                            },
                            { applicationName: azureApplicationName ?? '' }
                        )}
                    </Typography>
                </Box>
                <Box component="li">
                    <Typography>
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.instructions.azure.step3.reviewAssign',
                        })}
                    </Typography>
                </Box>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mx: 0,
                    borderLeft: '4px solid',
                    borderColor: 'divider',
                    pl: 2,
                }}
            >
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.step3.note',
                })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.instructions.azure.docsLink',
                })}
                <Link
                    href="https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.instructions.azure.docsLinkText',
                    })}
                </Link>
            </Typography>
        </Stack>
    );
}
