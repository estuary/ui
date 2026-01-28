import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    Fade,
    Link,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useFormContext } from 'react-hook-form';

import {
    AWS_REGIONS,
    CloudProviderCodes,
    GCP_REGIONS,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CardWrapper from 'src/components/shared/CardWrapper';
import { RHFCheckbox } from 'src/components/shared/forms/RHFCheckbox';
import { RHFMultiSelectWithDefault } from 'src/components/shared/forms/RHFMultiSelectWithDefault';
import { RHFSelect } from 'src/components/shared/forms/RHFSelect';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

// Example data planes for development
export const MOCK_DATA_PLANES: BaseDataPlaneQuery[] = [
    // Public data planes
    {
        id: '00000000-0000-0000-0000-000000000001',
        data_plane_name: 'ops/dp/public/gcp-us-central1-prod',
        reactor_address: 'https://us-central1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email:
            'flow-gcp-us-central1@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow-gcp-us-central1',
        data_plane_fqdn: 'us-central1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        data_plane_name: 'ops/dp/public/gcp-us-east1-prod',
        reactor_address: 'https://us-east1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email:
            'flow-gcp-us-east1@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow-gcp-us-east1',
        data_plane_fqdn: 'us-east1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        data_plane_name: 'ops/dp/public/aws-us-east-1',
        reactor_address: 'https://aws-us-east-1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email:
            'flow-aws-us-east-1@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow-aws-us-east-1',
        data_plane_fqdn: 'aws-us-east-1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        data_plane_name: 'ops/dp/public/aws-eu-west-1',
        reactor_address: 'https://aws-eu-west-1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email:
            'flow-aws-eu-west-1@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: 'arn:aws:iam::123456789012:user/flow-aws-eu-west-1',
        data_plane_fqdn: 'aws-eu-west-1.v1.estuary-data.dev',
    },
    // Private data planes
    {
        id: '00000000-0000-0000-0000-000000000005',
        data_plane_name: 'ops/dp/private/acme-corp/gcp-us-central1-prod',
        reactor_address: 'https://acme-prod.estuary-data.dev',
        cidr_blocks: ['10.0.0.0/8', '172.16.0.0/12'],
        gcp_service_account_email:
            'flow-acme-gcp-us-central1@acme-corp.iam.gserviceaccount.com',
        aws_iam_user_arn:
            'arn:aws:iam::987654321098:user/flow-acme-gcp-us-central1',
        data_plane_fqdn: 'acme-prod.estuary-data.dev',
    },
    // {
    //     id: '00000000-0000-0000-0000-000000000006',
    //     data_plane_name: 'ops/dp/private/acme-corp/aws-us-west-2-staging',
    //     reactor_address: 'https://acme-staging.estuary-data.dev',
    //     cidr_blocks: ['10.0.0.0/8'],
    //     gcp_service_account_email: 'flow@acme-staging.iam.gserviceaccount.com',
    //     aws_iam_user_arn: 'arn:aws:iam::987654321098:user/acme-flow',
    //     data_plane_fqdn: 'acme-staging.estuary-data.dev',
    // },
];

const PROVIDER_OPTIONS = Object.values(CloudProviderCodes).map((code) => ({
    value: code,
    label:
        code === CloudProviderCodes.AWS ? 'Amazon S3' : 'Google Cloud Storage',
}));

const getRegionOptions = (provider: CloudProviderCodes | '') => {
    const regions =
        provider === CloudProviderCodes.AWS
            ? AWS_REGIONS
            : provider === CloudProviderCodes.GCP
              ? GCP_REGIONS
              : [];

    return regions.map((region) => ({ value: region, label: region }));
};

export function StorageMappingForm() {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    // TODO: Replace with real data plane fetch
    const [dataPlaneOptions] = useState<BaseDataPlaneQuery[]>(MOCK_DATA_PLANES);
    const selectedDataPlaneIds = watch('data_planes');
    const provider = watch('provider');
    const selectAdditional = watch('select_additional');
    const useSameRegion = watch('use_same_region');
    const allowPublic = watch('allow_public');
    const regionOptions = useMemo(() => getRegionOptions(provider), [provider]);

    // Auto-enable "allow public" if there are no private data planes
    useEffect(() => {
        const hasPrivate = dataPlaneOptions.some(
            (option) => getDataPlaneScope(option.data_plane_name) === 'private'
        );
        if (dataPlaneOptions.length > 0 && !hasPrivate) {
            setValue('allow_public', true);
        }
    }, [dataPlaneOptions, setValue]);

    // Remove public data planes when allowPublic is unchecked
    useEffect(() => {
        if (!allowPublic && selectedDataPlaneIds?.length > 0) {
            const filtered = selectedDataPlaneIds.filter((id) => {
                const dataPlane = dataPlaneOptions.find(
                    (option) => option.id === id
                );
                if (!dataPlane) return false;
                return (
                    getDataPlaneScope(dataPlane.data_plane_name) === 'private'
                );
            });
            if (filtered.length !== selectedDataPlaneIds.length) {
                setValue('data_planes', filtered);
            }
        }
    }, [allowPublic, dataPlaneOptions, selectedDataPlaneIds, setValue]);

    // Get the primary (first) selected data plane for display
    const selectedDataPlane = useMemo(() => {
        const primaryId = selectedDataPlaneIds?.[0];
        if (!primaryId) return null;
        const dataPlane = dataPlaneOptions.find((dp) => dp.id === primaryId);
        if (!dataPlane) return null;

        const scope = getDataPlaneScope(dataPlane.data_plane_name);
        const parsedName = parseDataPlaneName(dataPlane.data_plane_name, scope);
        return {
            ...dataPlane,
            parsedName,
        };
    }, [selectedDataPlaneIds, dataPlaneOptions]);

    const hasPrivateDataPlanes = useMemo(
        () =>
            dataPlaneOptions.some(
                (option) =>
                    getDataPlaneScope(option.data_plane_name) === 'private'
            ),
        [dataPlaneOptions]
    );

    const dataPlaneSelectOptions = useMemo(
        () =>
            dataPlaneOptions
                .filter((option) => {
                    const scope = getDataPlaneScope(option.data_plane_name);
                    if (!hasPrivateDataPlanes) {
                        return true;
                    }
                    return scope === 'private' || allowPublic;
                })
                .map((option) => {
                    const scope = getDataPlaneScope(option.data_plane_name);
                    const parsedName = parseDataPlaneName(
                        option.data_plane_name,
                        scope
                    );
                    return {
                        value: option.id,
                        label: `${formatDataPlaneName(parsedName)} (${scope})`,
                    };
                })
                .sort((a, b) => a.label.localeCompare(b.label)),
        [dataPlaneOptions, hasPrivateDataPlanes, allowPublic]
    );

    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Configure a new storage mapping for your collection data. For
                more information and access requirements, see the{' '}
                <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
                    documentation
                </Link>
                .
            </Typography>
            <Stack spacing={2}>
                <CardWrapper>
                    <TextField
                        {...register('catalog_prefix', {
                            required: 'Estuary prefix is required',
                        })}
                        label="Estuary Prefix"
                        required
                        error={!!errors.catalog_prefix}
                        helperText={errors.catalog_prefix?.message}
                        fullWidth
                        size="small"
                        // variant="outlined"
                        // sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </CardWrapper>
                <CardWrapper>
                    <Stack spacing={2}>
                        {selectAdditional ? (
                            <RHFMultiSelectWithDefault
                                name="data_planes"
                                label="Data Planes"
                                options={dataPlaneSelectOptions}
                                required
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) &&
                                            value.length > 0) ||
                                        'At least one data plane is required',
                                }}
                            />
                        ) : (
                            <RHFSelect<StorageMappingFormData>
                                name="data_planes"
                                label="Data Plane"
                                options={dataPlaneSelectOptions}
                                required
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) &&
                                            value.length > 0) ||
                                        'Data plane is required',
                                }}
                                valueTransform={(value) =>
                                    (value as string[])?.[0] ?? ''
                                }
                                onChangeTransform={(value) => [value]}
                            />
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                // pl: 2,
                                color: 'text.secondary',
                            }}
                        >
                            <RHFCheckbox<StorageMappingFormData>
                                name="allow_public"
                                label="Allow public data planes"
                                disabled={!hasPrivateDataPlanes}
                            />

                            {dataPlaneSelectOptions.length > 1 ? (
                                <RHFCheckbox<StorageMappingFormData>
                                    name="select_additional"
                                    label="Select multiple data planes"
                                />
                            ) : null}
                        </Box>
                    </Stack>
                </CardWrapper>

                <CardWrapper>
                    <TextField
                        {...register('bucket', {
                            required: 'Bucket is required',
                        })}
                        required
                        label="Bucket"
                        error={!!errors.bucket}
                        helperText={
                            errors.bucket?.message ??
                            'Bucket into which Estuary will store data'
                        }
                        fullWidth
                        size="small"
                    />
                    <Stack spacing={2} sx={{ color: 'text.secondary' }}>
                        <Box sx={{ position: 'relative', height: 40 }}>
                            <Fade in={!useSameRegion}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        position: 'absolute',
                                        inset: 0,
                                    }}
                                >
                                    <RHFSelect<StorageMappingFormData>
                                        name="provider"
                                        label="Cloud Provider"
                                        options={PROVIDER_OPTIONS}
                                        required
                                        rules={{
                                            deps: ['use_same_region'],
                                            validate: (value, formValues) =>
                                                formValues.use_same_region ||
                                                !!value ||
                                                'Cloud provider is required',
                                        }}
                                    />

                                    <RHFSelect<StorageMappingFormData>
                                        name="region"
                                        label="Region"
                                        options={regionOptions}
                                        required
                                        disabled={!provider}
                                        rules={{
                                            deps: ['use_same_region'],
                                            validate: (value, formValues) =>
                                                formValues.use_same_region ||
                                                !!value ||
                                                'Region is required',
                                        }}
                                    />
                                </Box>
                            </Fade>
                            <Fade in={useSameRegion}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 4,
                                        position: 'absolute',
                                        inset: 0,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box sx={{ typography: 'body2' }}>
                                        <strong>Cloud provider:</strong>{' '}
                                        <TechnicalEmphasis>
                                            {selectedDataPlane?.parsedName
                                                .provider
                                                ? selectedDataPlane.parsedName
                                                      .provider === 'gcp'
                                                    ? 'Google Cloud Storage'
                                                    : 'Amazon S3'
                                                : '—'}
                                        </TechnicalEmphasis>
                                    </Box>
                                    <Box sx={{ typography: 'body2' }}>
                                        <strong>Region:</strong>{' '}
                                        <TechnicalEmphasis>
                                            {' '}
                                            {selectedDataPlane?.parsedName
                                                .region ?? '—'}
                                        </TechnicalEmphasis>
                                    </Box>
                                </Box>
                            </Fade>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RHFCheckbox<StorageMappingFormData>
                                name="use_same_region"
                                label="Storage bucket and default data plane are in the same region"
                            />
                            <Tooltip title="To avoid egress fees, we recommend using the same region as the default data plane.">
                                <HelpCircle
                                    fontSize="small"
                                    style={{ cursor: 'pointer' }}
                                />
                            </Tooltip>
                        </Box>
                        <TextField
                            {...register('storage_prefix')}
                            label="Storage Prefix"
                            fullWidth
                            size="small"
                            helperText="Optional prefix of keys written to the bucket"
                        />
                    </Stack>
                </CardWrapper>
            </Stack>
        </>
    );
}
