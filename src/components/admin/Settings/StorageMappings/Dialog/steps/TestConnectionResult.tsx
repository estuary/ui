import type {
    ConnectionTestResult,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Link,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { CheckCircle, Refresh, WarningTriangle } from 'iconoir-react';
import { useFormContext } from 'react-hook-form';

import { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';
import {
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';

// TODO: Import from shared location or pass as prop
const MOCK_DATA_PLANES: BaseDataPlaneQuery[] = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        data_plane_name: 'ops/dp/public/gcp-us-central1-prod',
        reactor_address: 'https://us-central1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email: 'flow@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: null,
        data_plane_fqdn: 'us-central1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        data_plane_name: 'ops/dp/public/gcp-us-east1-prod',
        reactor_address: 'https://us-east1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email: 'flow@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: null,
        data_plane_fqdn: 'us-east1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        data_plane_name: 'ops/dp/public/aws-us-east-1',
        reactor_address: 'https://aws-us-east-1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email: null,
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow',
        data_plane_fqdn: 'aws-us-east-1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        data_plane_name: 'ops/dp/public/aws-eu-west-1',
        reactor_address: 'https://aws-eu-west-1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email: null,
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow',
        data_plane_fqdn: 'aws-eu-west-1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000005',
        data_plane_name: 'ops/dp/private/acme-corp/gcp-us-central1-prod',
        reactor_address: 'https://acme-prod.estuary-data.dev',
        cidr_blocks: ['10.0.0.0/8', '172.16.0.0/12'],
        gcp_service_account_email: 'flow@acme-corp.iam.gserviceaccount.com',
        aws_iam_user_arn: null,
        data_plane_fqdn: 'acme-prod.estuary-data.dev',
    },
];

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

const anchorMap: Record<string, string> = {
    aws: 'amazon-s3-buckets',
    gcp: 'google-cloud-storage-buckets',
    azure: 'azure-blob-storage',
};

interface TestConnectionResultProps {
    result: ConnectionTestResult;
    onRetry: () => void;
}

const getProviderLabel = (provider: string): string => {
    if (provider === 'gcp' || provider === CloudProviderCodes.GCP) {
        return 'Google Cloud Storage';
    }
    if (provider === 'aws' || provider === CloudProviderCodes.AWS) {
        return 'Amazon S3';
    }
    return provider || '—';
};

interface ConnectionInstructionsProps {
    provider?: string;
    bucket?: string;
    iamArn?: string;
    gcpServiceAccountEmail?: string;
}

function ConnectionInstructions({
    provider,
    bucket,
    iamArn,
    gcpServiceAccountEmail,
}: ConnectionInstructionsProps) {
    const theme = useTheme();

    if (provider === 'gcp' || provider === CloudProviderCodes.GCP) {
        const serviceAccount =
            gcpServiceAccountEmail ||
            'flow@estuary-data.iam.gserviceaccount.com';

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
                    Using the Google Cloud Console or gsutil, grant the service
                    account the following roles on your bucket{' '}
                    <TechnicalEmphasis>{bucket || 'your-bucket'}</TechnicalEmphasis>:
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
                    {`gsutil iam ch serviceAccount:${serviceAccount}:objectAdmin gs://${bucket || 'your-bucket'}`}
                </Box>

                <Typography variant="body2">
                    Or in the Cloud Console, navigate to your bucket, click
                    &quot;Permissions&quot;, then &quot;Grant Access&quot;, and add the service
                    account with the &quot;Storage Object Admin&quot; role.
                </Typography>
            </Stack>
        );
    }
    if (provider === 'aws' || provider === CloudProviderCodes.AWS) {
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
                    {iamArn ||
                        'arn:aws:iam::123456789012:role/estuary-flow-role'}
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
    return <Typography>Connection instructions go here.</Typography>;
}

function TestConnectionResult({ result, onRetry }: TestConnectionResultProps) {
    const theme = useTheme();
    const { getValues } = useFormContext<StorageMappingFormData>();
    const formData = getValues();
    const isTesting = result.status === 'testing' || result.status === 'idle';

    // Derive provider, region, and service account info from data plane
    const { provider, displayProvider, displayRegion, iamArn, gcpServiceAccountEmail } = useMemo(() => {
        const dataPlane = MOCK_DATA_PLANES.find(
            (dp) => dp.id === formData.data_plane
        );

        if (formData.use_same_region && dataPlane) {
            const scope = getDataPlaneScope(dataPlane.data_plane_name);
            const parsedName = parseDataPlaneName(
                dataPlane.data_plane_name,
                scope
            );
            return {
                provider: parsedName.provider,
                displayProvider: getProviderLabel(parsedName.provider),
                displayRegion: parsedName.region || '—',
                iamArn: dataPlane.aws_iam_user_arn ?? undefined,
                gcpServiceAccountEmail: dataPlane.gcp_service_account_email ?? undefined,
            };
        }
        return {
            provider: formData.provider,
            displayProvider: getProviderLabel(formData.provider),
            displayRegion: formData.region || '—',
            iamArn: dataPlane?.aws_iam_user_arn ?? undefined,
            gcpServiceAccountEmail: dataPlane?.gcp_service_account_email ?? undefined,
        };
    }, [
        formData.use_same_region,
        formData.data_plane,
        formData.provider,
        formData.region,
    ]);

    return (
        <Stack spacing={3}>
            <Typography>
                Grant Estuary access to your storage bucket. For detailed
                instructions,
                <br /> see the{' '}
                <Link
                    href={docsBaseUrl + anchorMap[provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    documentation
                </Link>
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: 2,
                    rowGap: 0.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: codeBackground[theme.palette.mode],
                    border: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="body2">
                    <strong>Bucket:</strong>
                </Typography>
                <TechnicalEmphasis>{formData.bucket || '—'}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Provider:</strong>
                </Typography>
                <TechnicalEmphasis>{displayProvider}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Region:</strong>
                </Typography>
                <TechnicalEmphasis>{displayRegion}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Prefix:</strong>
                </Typography>
                <TechnicalEmphasis>
                    {formData.catalog_prefix || '—'}
                </TechnicalEmphasis>
            </Box>

            <ConnectionInstructions
                provider={provider}
                bucket={formData.bucket}
                iamArn={iamArn}
                gcpServiceAccountEmail={gcpServiceAccountEmail}
            />

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                        result.status === 'success'
                            ? 'success.main'
                            : result.status === 'error'
                              ? 'error.main'
                              : 'action.hover',
                    color:
                        result.status === 'success' || result.status === 'error'
                            ? 'common.white'
                            : 'text.primary',
                }}
            >
                {isTesting ? (
                    <>
                        <CircularProgress size={24} color="inherit" />
                        <Typography>Testing connection...</Typography>
                    </>
                ) : null}
                {result.status === 'success' ? (
                    <>
                        <CheckCircle />
                        <Typography>Connection successful!</Typography>
                    </>
                ) : null}
                {result.status === 'error' ? (
                    <>
                        <WarningTriangle />
                        <Typography sx={{ flex: 1 }}>
                            {result.errorMessage}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onRetry}
                            startIcon={<Refresh />}
                            sx={{
                                'color': 'common.white',
                                'borderColor': 'common.white',
                                '&:hover': {
                                    borderColor: 'common.white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Retry
                        </Button>
                    </>
                ) : null}
            </Box>
        </Stack>
    );
}

export default TestConnectionResult;
