import { Box, Stack, Typography, useTheme } from '@mui/material';

import { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
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

interface ConnectionInstructionsProps {
    provider: CloudProvider;
    bucket: string;
    iamArn: string;
    gcpServiceAccountEmail: string;
}

export function ConnectionInstructions({
    provider,
    bucket,
    iamArn,
    gcpServiceAccountEmail,
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
    return <Typography>Connection instructions go here.</Typography>;
}
