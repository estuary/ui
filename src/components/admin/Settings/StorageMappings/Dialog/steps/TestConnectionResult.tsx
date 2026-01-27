import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import type {
    ConnectionTestResult,
    ConnectionTestResults,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Link,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import {
    CheckCircle,
    NavArrowDown,
    Refresh,
    WarningTriangle,
} from 'iconoir-react';
import { useFormContext } from 'react-hook-form';

import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import { MOCK_DATA_PLANES } from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

const anchorMap: Record<string, string> = {
    aws: 'amazon-s3-buckets',
    gcp: 'google-cloud-storage-buckets',
    azure: 'azure-blob-storage',
};

interface TestConnectionResultProps {
    results: ConnectionTestResults;
    onRetry: (dataPlaneId: string) => void;
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

interface ConnectionStatusBadgeProps {
    result: ConnectionTestResult;
    compact?: boolean;
}

function ConnectionStatusBadge({
    result,
    compact = false,
}: ConnectionStatusBadgeProps) {
    const isTesting = result.status === 'testing' || result.status === 'idle';

    if (isTesting) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={compact ? 16 : 20} color="inherit" />
            </Box>
        );
    }

    if (result.status === 'success') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'success.main',
                }}
            >
                <Typography variant="body2">Ready</Typography>
                <CheckCircle
                    width={compact ? 16 : 20}
                    height={compact ? 16 : 20}
                />
            </Box>
        );
    }

    if (result.status === 'error') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'warning.main',
                }}
            >
                <Typography variant="body2">Needs Attention</Typography>
                <WarningTriangle
                    width={compact ? 16 : 20}
                    height={compact ? 16 : 20}
                />
            </Box>
        );
    }

    return null;
}

interface ConnectionErrorDetailsProps {
    result: ConnectionTestResult;
    errorMessage?: string;
    onRetry: () => void;
}

function ConnectionErrorDetails({
    result,
    errorMessage,
    onRetry,
}: ConnectionErrorDetailsProps) {
    const message = errorMessage || result.errorMessage || 'Connection failed';
    const isRetrying = result.status === 'testing';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'warning.main',
            }}
        >
            <Typography variant="body2" sx={{ flex: 1 }}>
                {message}
            </Typography>
            <Button
                variant="text"
                size="small"
                disabled={isRetrying}
                onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                }}
                startIcon={
                    isRetrying ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <Refresh width={16} height={16} />
                    )
                }
                sx={{ ml: 1 }}
            >
                {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
        </Box>
    );
}

interface ConnectionInstructionsProps {
    provider: string;
    bucket: string;
    iamArn: string;
    gcpServiceAccountEmail: string;
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
                    Using <TechnicalEmphasis>gsutil</TechnicalEmphasis>, grant
                    the admin role to the the service account using the
                    following command:
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
                    &quot;Permissions&quot;, then &quot;Grant Access&quot;, and
                    add the service account with the &quot;Storage Admin&quot;
                    role.
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

function TestConnectionResult({ results, onRetry }: TestConnectionResultProps) {
    const theme = useTheme();
    const { getValues } = useFormContext<StorageMappingFormData>();
    const formData = getValues();

    const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
    const prevResultsRef = useRef<ConnectionTestResults>({});
    const [lastErrorMessages, setLastErrorMessages] = useState<
        Record<string, string>
    >({});

    // Track error messages and collapse accordion when connection succeeds
    useEffect(() => {
        // Capture error messages when they occur
        Object.entries(results).forEach(([id, result]) => {
            if (result.status === 'error' && result.errorMessage) {
                setLastErrorMessages((prev) => ({
                    ...prev,
                    [id]: result.errorMessage!,
                }));
            }
        });

        // Collapse accordion on status change to success
        if (expandedPanel) {
            const prevStatus = prevResultsRef.current[expandedPanel]?.status;
            const currentStatus = results[expandedPanel]?.status;
            if (prevStatus !== 'success' && currentStatus === 'success') {
                setExpandedPanel(false);
            }
        }
        prevResultsRef.current = results;
    }, [results, expandedPanel]);

    // Get all selected data planes
    const allDataPlanes = useMemo(() => {
        return (formData.data_planes ?? [])
            .map((id: string) => MOCK_DATA_PLANES.find((dp) => dp.id === id))
            .filter(Boolean) as BaseDataPlaneQuery[];
    }, [formData.data_planes]);

    // Derive provider, region for display (from primary data plane or form)
    const { provider, displayProvider, displayRegion } = useMemo(() => {
        const dataPlane = MOCK_DATA_PLANES.find(
            (dp) => dp.id === formData.data_planes?.[0]
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
            };
        }
        return {
            provider: formData.provider,
            displayProvider: getProviderLabel(formData.provider),
            displayRegion: formData.region || '—',
        };
    }, [
        formData.use_same_region,
        formData.data_planes,
        formData.provider,
        formData.region,
    ]);

    const getDataPlaneLabel = (dataPlane: BaseDataPlaneQuery) => {
        const scope = getDataPlaneScope(dataPlane.data_plane_name);
        const parsedName = parseDataPlaneName(dataPlane.data_plane_name, scope);
        return formatDataPlaneName(parsedName);
    };

    const handleAccordionChange =
        (panel: string) =>
        (_event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpandedPanel(isExpanded ? panel : false);
        };

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

                {formData.storage_prefix ? (
                    <>
                        <Typography variant="body2">
                            <strong>Prefix:</strong>
                        </Typography>
                        <TechnicalEmphasis>
                            {formData.storage_prefix}
                        </TechnicalEmphasis>
                    </>
                ) : null}
            </Box>

            <Stack spacing={1}>
                {allDataPlanes.map((dataPlane) => {
                    const testResult = results[dataPlane.id] ?? {
                        status: 'idle',
                    };

                    return (
                        <Accordion
                            key={dataPlane.id}
                            expanded={expandedPanel === dataPlane.id}
                            onChange={handleAccordionChange(dataPlane.id)}
                            disableGutters
                            sx={{
                                '&:before': { display: 'none' },
                                'border': 1,
                                'borderColor':
                                    testResult.status === 'success'
                                        ? 'success.main'
                                        : testResult.status === 'error'
                                          ? 'warning.main'
                                          : 'divider',
                                'borderRadius': 2,
                                '&:first-of-type': { borderRadius: 2 },
                                '&:last-of-type': { borderRadius: 2 },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<NavArrowDown />}
                                sx={{ minHeight: 48 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        pr: 1,
                                    }}
                                >
                                    <Typography fontWeight={600}>
                                        {getDataPlaneLabel(dataPlane)}
                                    </Typography>
                                    <ConnectionStatusBadge
                                        result={testResult}
                                        compact
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={2}>
                                    {testResult.status === 'error' ||
                                    (testResult.status === 'testing' &&
                                        lastErrorMessages[dataPlane.id]) ? (
                                        <ConnectionErrorDetails
                                            result={testResult}
                                            errorMessage={
                                                lastErrorMessages[dataPlane.id]
                                            }
                                            onRetry={() =>
                                                onRetry(dataPlane.id)
                                            }
                                        />
                                    ) : null}
                                    <ConnectionInstructions
                                        provider={provider}
                                        bucket={formData.bucket}
                                        iamArn={
                                            dataPlane.aws_iam_user_arn ?? ''
                                        }
                                        gcpServiceAccountEmail={
                                            dataPlane.gcp_service_account_email ??
                                            ''
                                        }
                                    />
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Stack>
        </Stack>
    );
}

export default TestConnectionResult;
