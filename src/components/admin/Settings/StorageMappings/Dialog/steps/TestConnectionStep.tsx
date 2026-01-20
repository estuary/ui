import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { CheckCircle, WarningTriangle } from 'iconoir-react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
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

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const getProviderLabel = (provider: string): string => {
    if (provider === 'gcp' || provider === CloudProviderCodes.GCS) {
        return 'Google Cloud Storage';
    }
    if (provider === 'aws' || provider === CloudProviderCodes.S3) {
        return 'Amazon S3';
    }
    return provider || '—';
};

function TestConnectionStep() {
    const { getValues } = useFormContext<StorageMappingFormData>();
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const formData = getValues();

    // Derive provider and region from data plane if use_same_region is true
    const { displayProvider, displayRegion } = useMemo(() => {
        if (formData.use_same_region && formData.data_plane) {
            const dataPlane = MOCK_DATA_PLANES.find(
                (dp) => dp.id === formData.data_plane
            );
            if (dataPlane) {
                const scope = getDataPlaneScope(dataPlane.data_plane_name);
                const parsedName = parseDataPlaneName(
                    dataPlane.data_plane_name,
                    scope
                );
                return {
                    displayProvider: getProviderLabel(parsedName.provider),
                    displayRegion: parsedName.region || '—',
                };
            }
        }
        return {
            displayProvider: getProviderLabel(formData.provider),
            displayRegion: formData.region || '—',
        };
    }, [formData.use_same_region, formData.data_plane, formData.provider, formData.region]);

    useEffect(() => {
        // Auto-start connection test when step mounts
        const testConnection = async () => {
            setStatus('testing');
            setErrorMessage(null);

            try {
                // TODO: Replace with actual connection test API call
                // This simulates a connection test
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Simulate success (or failure based on some condition)
                const success = Math.random() > 0.3; // 70% success rate for demo
                if (success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setErrorMessage(
                        'Unable to access bucket. Please verify your bucket name and permissions.'
                    );
                }
            } catch {
                setStatus('error');
                setErrorMessage('An unexpected error occurred while testing the connection.');
            }
        };

        testConnection();
    }, []);

    return (
        <Stack spacing={3}>
            <Typography>
                Testing connection to your storage bucket...
            </Typography>

            <Box
                sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Configuration Summary
                    </Typography>
                    <Stack spacing={1}>
                        <Typography variant="body2">
                            <strong>Bucket:</strong> {formData.bucket || '—'}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Prefix:</strong> {formData.catalog_prefix || '—'}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Provider:</strong> {displayProvider}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Region:</strong> {displayRegion}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                        status === 'success'
                            ? 'success.main'
                            : status === 'error'
                              ? 'error.main'
                              : 'action.hover',
                    color:
                        status === 'success' || status === 'error'
                            ? 'common.white'
                            : 'text.primary',
                }}
            >
                {status === 'testing' ? (
                    <>
                        <CircularProgress size={24} color="inherit" />
                        <Typography>Testing connection...</Typography>
                    </>
                ) : null}
                {status === 'success' ? (
                    <>
                        <CheckCircle />
                        <Typography>Connection successful!</Typography>
                    </>
                ) : null}
                {status === 'error' ? (
                    <>
                        <WarningTriangle />
                        <Typography>{errorMessage}</Typography>
                    </>
                ) : null}
                {status === 'idle' ? (
                    <Typography color="text.secondary">
                        Preparing connection test...
                    </Typography>
                ) : null}
            </Box>
        </Stack>
    );
}

export default TestConnectionStep;
