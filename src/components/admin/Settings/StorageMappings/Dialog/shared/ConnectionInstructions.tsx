import type { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { Box, Button, Link, Stack, Typography, useTheme } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';

interface GcpConnectionInstructionsProps {
    bucket: string;
    gcpServiceAccountEmail: string;
}

function GcpConnectionInstructions({
    bucket,
    gcpServiceAccountEmail,
}: GcpConnectionInstructionsProps) {
    const theme = useTheme();
    const serviceAccount =
        gcpServiceAccountEmail || 'flow@estuary-data.iam.gserviceaccount.com';

    return (
        <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>
                Step 1: Copy the Service Account Email
            </Typography>
            <Typography variant="body2">
                Grant this service account access to your GCS bucket:
            </Typography>
            <Box
                component="pre"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: codeBackground[theme.palette.mode],
                    overflow: 'auto',
                    fontSize: 13,
                    fontFamily: 'monospace',
                }}
            >
                {serviceAccount}
            </Box>

            <Typography variant="subtitle2" fontWeight={700}>
                Step 2: Grant bucket permissions
            </Typography>
            <Typography variant="body2">
                Using <TechnicalEmphasis>gsutil</TechnicalEmphasis>, grant the
                admin role to the the service account using the following
                command:
            </Typography>
            <Box
                component="pre"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: codeBackground[theme.palette.mode],
                    overflow: 'auto',
                    fontSize: 13,
                    fontFamily: 'monospace',
                }}
            >
                {`gsutil iam ch serviceAccount:${serviceAccount}:admin gs://${bucket || 'your-bucket'}`}
            </Box>

            <Typography variant="body2">
                Or in the Cloud Console, navigate to your bucket, click
                &quot;Permissions&quot;, then &quot;Grant Access&quot;, and add
                the service account with the &quot;Storage Admin&quot; role.
            </Typography>
        </Stack>
    );
}

interface AwsConnectionInstructionsProps {
    bucket: string;
    iamArn: string;
}

function AwsConnectionInstructions({
    bucket,
    iamArn,
}: AwsConnectionInstructionsProps) {
    const theme = useTheme();
    const bucketPolicy = JSON.stringify(
        {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: {
                        AWS:
                            iamArn ||
                            'arn:aws:iam::123456789012:role/estuary-flow-role',
                    },
                    Action: [
                        's3:GetObject',
                        's3:PutObject',
                        's3:DeleteObject',
                        's3:ListBucket',
                        's3:GetBucketPolicy',
                    ],
                    Resource: [
                        `arn:aws:s3:::${bucket || 'your-bucket'}`,
                        `arn:aws:s3:::${bucket || 'your-bucket'}/*`,
                    ],
                },
            ],
        },
        null,
        2
    );

    return (
        <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>
                Step 1: Copy the IAM Role ARN
            </Typography>
            <Typography variant="body2">
                Add this ARN to your S3 bucket policy or IAM role trust
                relationship:
            </Typography>
            <Box
                component="pre"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: codeBackground[theme.palette.mode],
                    overflow: 'auto',
                    fontSize: 13,
                    fontFamily: 'monospace',
                }}
            >
                {iamArn || 'arn:aws:iam::123456789012:role/estuary-flow-role'}
            </Box>

            <Typography variant="subtitle2" fontWeight={700}>
                Step 2: Apply this bucket policy
            </Typography>
            <Typography variant="body2">
                Add this policy to your S3 bucket to grant the necessary
                permissions:
            </Typography>
            <Box
                component="pre"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: codeBackground[theme.palette.mode],
                    overflow: 'auto',
                    fontSize: 13,
                    fontFamily: 'monospace',
                }}
            >
                {bucketPolicy}
            </Box>
        </Stack>
    );
}

interface AzureConnectionInstructionsProps {
    storageAccountName: string;
    containerName: string;
    azureApplicationClientId: string;
    azureApplicationName: string;
}

function AzureConnectionInstructions({
    storageAccountName,
    containerName,
    azureApplicationClientId,
    azureApplicationName,
}: AzureConnectionInstructionsProps) {
    const theme = useTheme();
    const preStyles = {
        p: 2,
        borderRadius: 2,
        bgcolor: codeBackground[theme.palette.mode],
        overflow: 'auto',
        fontSize: 13,
        fontFamily: 'monospace',
    };

    const clientId =
        azureApplicationClientId || '00000000-0000-0000-0000-000000000000';
    const appName = azureApplicationName || 'UH OH';

    const consentUrl = `https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id=${clientId}&scope=https://storage.azure.com/.default`;
    const azureDocsUrl =
        'https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal';

    return (
        <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>
                Step 1: Authorize the Estuary application in your Azure tenant
            </Typography>
            <Typography variant="body2">
                An Azure AD administrator must consent to the{' '}
                <TechnicalEmphasis>{appName}</TechnicalEmphasis> application.
                This creates a service principal in your tenant that Estuary
                uses to access your storage.
            </Typography>

            <Button
                variant="outlined"
                size="small"
                endIcon={<OpenNewWindow width={16} height={16} />}
                href={consentUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ alignSelf: 'flex-start' }}
            >
                Authorize in Azure
            </Button>

            <Typography variant="subtitle2" fontWeight={700}>
                Step 2: Assign the Storage Blob Data Owner role
            </Typography>
            <Typography variant="body2">
                After consenting, grant the{' '}
                <TechnicalEmphasis>Storage Blob Data Owner</TechnicalEmphasis>{' '}
                role to <TechnicalEmphasis>{appName}</TechnicalEmphasis> on your
                storage account.
            </Typography>

            <Stack component="ol" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2">
                    Navigate to your storage account{' '}
                    {storageAccountName ? (
                        <TechnicalEmphasis>
                            {storageAccountName}
                        </TechnicalEmphasis>
                    ) : null}
                </Typography>
                <Typography component="li" variant="body2">
                    Open &quot;Access Control (IAM)&quot;
                </Typography>
                <Typography component="li" variant="body2">
                    Click &quot;Add role assignment&quot;
                </Typography>
                <Typography component="li" variant="body2">
                    Select role:{' '}
                    <TechnicalEmphasis>
                        Storage Blob Data Owner
                    </TechnicalEmphasis>
                </Typography>
                <Typography component="li" variant="body2">
                    Search for and select{' '}
                    <TechnicalEmphasis>{appName}</TechnicalEmphasis>
                </Typography>
                <Typography component="li" variant="body2">
                    Save
                </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
                Note: Azure RBAC role assignments can take up to 10 minutes to
                propagate. If the connection test fails after assigning the
                role, wait a few minutes and retry.
            </Typography>

            <Typography variant="body2" color="text.secondary">
                For more help, see the{' '}
                <Link
                    href={azureDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Azure docs
                </Link>
            </Typography>

            {containerName ? (
                <Typography variant="body2" color="text.secondary">
                    Container:{' '}
                    <TechnicalEmphasis>{containerName}</TechnicalEmphasis>
                </Typography>
            ) : null}
        </Stack>
    );
}

interface ConnectionInstructionsProps {
    provider: CloudProvider;
    bucket: string;
    iamArn: string;
    gcpServiceAccountEmail: string;
    storageAccountName?: string;
    azureApplicationClientId?: string;
    azureApplicationName?: string;
}

export function ConnectionInstructions({
    provider,
    bucket,
    iamArn,
    gcpServiceAccountEmail,
    storageAccountName,
    azureApplicationClientId,
    azureApplicationName,
}: ConnectionInstructionsProps) {
    if (provider === 'GCP') {
        return (
            <GcpConnectionInstructions
                bucket={bucket}
                gcpServiceAccountEmail={gcpServiceAccountEmail}
            />
        );
    }
    if (provider === 'AWS') {
        return <AwsConnectionInstructions bucket={bucket} iamArn={iamArn} />;
    }
    if (provider === 'AZURE') {
        return (
            <AzureConnectionInstructions
                storageAccountName={storageAccountName ?? ''}
                containerName={bucket}
                azureApplicationClientId={azureApplicationClientId ?? ''}
                azureApplicationName={azureApplicationName ?? ''}
            />
        );
    }
    return null;
}
