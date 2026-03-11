import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest/ConnectionTestContext';

import {
    Link,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';

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

            <List component="ol" disablePadding sx={{ listStyleType: 'decimal', pl: 4 }}>
                {([
                    {
                        id: 'storageMappings.dialog.instructions.azure.step3.navigateToAccount',
                        values: { storageAccountName },
                    },
                    { id: 'storageMappings.dialog.instructions.azure.step3.openIam' },
                    { id: 'storageMappings.dialog.instructions.azure.step3.addRole' },
                    { id: 'storageMappings.dialog.instructions.azure.step3.selectRole' },
                    {
                        id: 'storageMappings.dialog.instructions.azure.step3.selectMember',
                        values: { applicationName: azureApplicationName ?? '' },
                    },
                    { id: 'storageMappings.dialog.instructions.azure.step3.reviewAssign' },
                ] as const).map(({ id, ...rest }) => (
                    <ListItem key={id} disablePadding sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary={intl.formatMessage(
                                { id },
                                'values' in rest ? rest.values : undefined
                            )}
                        />
                    </ListItem>
                ))}
            </List>

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
