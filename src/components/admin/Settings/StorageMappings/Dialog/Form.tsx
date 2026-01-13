import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
} from '@mui/material';

import { ajvResolver } from '@hookform/resolvers/ajv';
import { useForm } from 'react-hook-form';

import { BaseDataPlaneQuery, getDataPlaneOptions } from 'src/api/dataPlanes';
import {
    AWS_REGIONS,
    CloudProviderCodes,
    GCP_REGIONS,
} from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import {
    StorageMappingFormData,
    storageMappingSchema,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import { SelectField } from 'src/components/admin/Settings/StorageMappings/Dialog/SelectField';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';

// Example data planes for development
const MOCK_DATA_PLANES: BaseDataPlaneQuery[] = [
    // Public data planes
    {
        id: '00000000-0000-0000-0000-000000000001',
        data_plane_name: 'ops/dp/public/gcp-us-central1',
        reactor_address: 'https://us-central1.v1.estuary-data.dev',
        cidr_blocks: null,
        gcp_service_account_email: 'flow@estuary-data.iam.gserviceaccount.com',
        aws_iam_user_arn: null,
        data_plane_fqdn: 'us-central1.v1.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        data_plane_name: 'ops/dp/public/gcp-us-east1',
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
    // Private data planes
    {
        id: '00000000-0000-0000-0000-000000000005',
        data_plane_name: 'ops/dp/private/acme-corp/gcp-us-central1-prod',
        reactor_address: 'https://acme-prod.estuary-data.dev',
        cidr_blocks: ['10.0.0.0/8', '172.16.0.0/12'],
        gcp_service_account_email: 'flow@acme-corp.iam.gserviceaccount.com',
        aws_iam_user_arn: null,
        data_plane_fqdn: 'acme-prod.estuary-data.dev',
    },
    {
        id: '00000000-0000-0000-0000-000000000006',
        data_plane_name: 'ops/dp/private/acme-corp/aws-us-west-2-staging',
        reactor_address: 'https://acme-staging.estuary-data.dev',
        cidr_blocks: ['10.0.0.0/8'],
        gcp_service_account_email: null,
        aws_iam_user_arn: 'arn:aws:iam::987654321098:user/acme-flow',
        data_plane_fqdn: 'acme-staging.estuary-data.dev',
    },
];

const PROVIDER_OPTIONS = Object.values(CloudProviderCodes).map((code) => ({
    value: code,
    label:
        code === CloudProviderCodes.S3 ? 'Amazon S3' : 'Google Cloud Storage',
}));

const getRegionOptions = (provider: CloudProviderCodes | '') => {
    const regions =
        provider === CloudProviderCodes.S3
            ? AWS_REGIONS
            : provider === CloudProviderCodes.GCS
              ? GCP_REGIONS
              : [];

    return regions.map((region) => ({ value: region, label: region }));
};

export function StorageMappingForm() {
    const [dataPlaneOptions, setDataPlaneOptions] = useState<
        BaseDataPlaneQuery[]
    >([]);
    const [includePublic, setIncludePublic] = useState(false);

    useEffect(() => {
        // Use mock data for development
        setDataPlaneOptions(MOCK_DATA_PLANES);

        // Uncomment to use real data
        // getDataPlaneOptions().then((response) => {
        //     if (response.data) {
        //         setDataPlaneOptions(response.data);
        //     }
        // });
    }, []);

    const {
        register,
        watch,
        formState: { errors },
    } = useForm<StorageMappingFormData>({
        resolver: ajvResolver(storageMappingSchema),
        // mode: 'onBlur',
        defaultValues: {
            catalog_prefix: '',
            provider: '',
            region: '',
            bucket: '',
            storage_prefix: '',
            data_plane: '',
            select_multiple: false,
        },
    });

    const provider = watch('provider');
    const regionOptions = useMemo(() => getRegionOptions(provider), [provider]);

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
                    return scope === 'private' || includePublic;
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
                }),
        [dataPlaneOptions, hasPrivateDataPlanes, includePublic]
    );

    return (
        <Stack spacing={2}>
            {/* {JSON.stringify(dataPlaneOptions)} */}
            <TextField
                {...register('catalog_prefix')}
                label="Catalog Prefix"
                error={!!errors.catalog_prefix}
                helperText={errors.catalog_prefix?.message}
                fullWidth
                size="small"
            />

            <Box
                component="fieldset"
                sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                }}
            >
                <legend>Data Plane</legend>

                <Stack spacing={2}>
                    <SelectField
                        name="data_plane"
                        register={register}
                        label="Data Plane"
                        options={dataPlaneSelectOptions}
                        error={!!errors.data_plane}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {hasPrivateDataPlanes && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={includePublic}
                                        onChange={(e) =>
                                            setIncludePublic(e.target.checked)
                                        }
                                        size="small"
                                    />
                                }
                                label="Include public"
                            />
                        )}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...register('select_multiple')}
                                    size="small"
                                />
                            }
                            label="Select Multiple"
                        />
                    </Box>
                </Stack>
            </Box>

            <Box
                component="fieldset"
                sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                }}
            >
                <legend>Storage Bucket</legend>

                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <SelectField
                            name="provider"
                            register={register}
                            label="Cloud Provider"
                            options={PROVIDER_OPTIONS}
                            error={!!errors.provider}
                        />

                        <SelectField
                            name="region"
                            register={register}
                            label="Region"
                            options={regionOptions}
                            disabled={!provider}
                            error={!!errors.region}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            {...register('bucket')}
                            label="Bucket"
                            error={!!errors.bucket}
                            helperText={errors.bucket?.message}
                            fullWidth
                            size="small"
                        />

                        <TextField
                            {...register('storage_prefix')}
                            label="Storage Prefix"
                            fullWidth
                            size="small"
                        />
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}
