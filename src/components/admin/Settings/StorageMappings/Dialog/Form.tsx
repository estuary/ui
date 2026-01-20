import { useEffect, useMemo, useState } from 'react';

import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    Fade,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { Controller, useFormContext } from 'react-hook-form';

import { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import {
    AWS_REGIONS,
    CloudProviderCodes,
    GCP_REGIONS,
} from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CardWrapper from 'src/components/shared/CardWrapper';
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
    // {
    //     id: '00000000-0000-0000-0000-000000000006',
    //     data_plane_name: 'ops/dp/private/acme-corp/aws-us-west-2-staging',
    //     reactor_address: 'https://acme-staging.estuary-data.dev',
    //     cidr_blocks: ['10.0.0.0/8'],
    //     gcp_service_account_email: null,
    //     aws_iam_user_arn: 'arn:aws:iam::987654321098:user/acme-flow',
    //     data_plane_fqdn: 'acme-staging.estuary-data.dev',
    // },
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
    const [includePublic, setIncludePublic] = useState<boolean | null>(null);
    const [additionalDataPlanes, setAdditionalDataPlanes] = useState<
        { value: string; label: string }[]
    >([]);

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

    // Set includePublic default based on whether private data planes are available
    useEffect(() => {
        if (includePublic === null && dataPlaneOptions.length > 0) {
            const hasPrivate = dataPlaneOptions.some(
                (option) =>
                    getDataPlaneScope(option.data_plane_name) === 'private'
            );
            // Default to not including public if private data planes are available
            setIncludePublic(!hasPrivate);
        }
    }, [dataPlaneOptions, includePublic]);

    const {
        control,
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    const selectedDataPlaneId = watch('data_plane');
    const provider = watch('provider');
    const selectAdditional = watch('select_additional');
    const useSameRegion = watch('use_same_region');
    const regionOptions = useMemo(() => getRegionOptions(provider), [provider]);

    // Remove the default data plane from additional data planes when it changes
    useEffect(() => {
        if (selectedDataPlaneId) {
            setAdditionalDataPlanes((prev) =>
                prev.filter((dp) => dp.value !== selectedDataPlaneId)
            );
        }
    }, [selectedDataPlaneId]);

    // Remove public data planes from additional data planes when includePublic is unchecked
    useEffect(() => {
        if (!includePublic) {
            setAdditionalDataPlanes((prev) =>
                prev.filter((dp) => {
                    const dataPlane = dataPlaneOptions.find(
                        (option) => option.id === dp.value
                    );
                    if (!dataPlane) return false;
                    return (
                        getDataPlaneScope(dataPlane.data_plane_name) ===
                        'private'
                    );
                })
            );
        }
    }, [includePublic, dataPlaneOptions]);

    const selectedDataPlane = useMemo(() => {
        if (!selectedDataPlaneId) return null;
        const dataPlane = dataPlaneOptions.find(
            (dp) => dp.id === selectedDataPlaneId
        );
        if (!dataPlane) return null;

        const scope = getDataPlaneScope(dataPlane.data_plane_name);
        const parsedName = parseDataPlaneName(dataPlane.data_plane_name, scope);
        return {
            ...dataPlane,
            parsedName,
        };
    }, [selectedDataPlaneId, dataPlaneOptions]);

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
                })
                .sort((a, b) => a.label.localeCompare(b.label)),
        [dataPlaneOptions, hasPrivateDataPlanes, includePublic]
    );

    return (
        <Stack spacing={2}>
            {/* {JSON.stringify(dataPlaneOptions)} */}
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
                        <>
                            <Autocomplete
                                multiple
                                disableClearable
                                value={[
                                    ...dataPlaneSelectOptions.filter(
                                        (opt) =>
                                            opt.value === selectedDataPlaneId
                                    ),
                                    ...additionalDataPlanes,
                                ]}
                                onChange={(_event, newValue) => {
                                    if (newValue.length > 0) {
                                        setValue(
                                            'data_plane',
                                            newValue[0].value
                                        );
                                        setAdditionalDataPlanes(
                                            newValue.slice(1)
                                        );
                                    } else {
                                        setValue('data_plane', '');
                                        setAdditionalDataPlanes([]);
                                    }
                                }}
                                options={dataPlaneSelectOptions}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                renderTags={(value, getTagProps) => (
                                    <Box sx={{ width: '100%' }}>
                                        {value.length > 0 && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb:
                                                        value.length > 1
                                                            ? 0.5
                                                            : 0,
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        typography: 'caption',
                                                        color: 'text.secondary',
                                                    }}
                                                >
                                                    Default:
                                                </Box>
                                                <Chip
                                                    {...getTagProps({
                                                        index: 0,
                                                    })}
                                                    label={value[0].label}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </Box>
                                        )}
                                        {value.length > 1 && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        typography: 'caption',
                                                        color: 'text.secondary',
                                                        lineHeight: '24px',
                                                    }}
                                                >
                                                    Additional:
                                                </Box>
                                                <Stack spacing={0.5}>
                                                    {value
                                                        .slice(1)
                                                        .map((option, i) => (
                                                            <Chip
                                                                {...getTagProps(
                                                                    {
                                                                        index:
                                                                            i +
                                                                            1,
                                                                    }
                                                                )}
                                                                key={
                                                                    option.value
                                                                }
                                                                label={
                                                                    option.label
                                                                }
                                                                size="small"
                                                            />
                                                        ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Data Planes"
                                        size="small"
                                        required
                                        error={!!errors.data_plane}
                                        // variant="outlined"
                                    />
                                )}
                                size="small"
                            />
                        </>
                    ) : (
                        <Controller
                            name="data_plane"
                            control={control}
                            rules={{ required: 'Data plane is required' }}
                            render={({ field }) => (
                                <FormControl
                                    fullWidth
                                    size="small"
                                    required
                                    error={!!errors.data_plane}
                                >
                                    <InputLabel>Data Plane</InputLabel>
                                    <Select {...field} label="Data Plane">
                                        {dataPlaneSelectOptions.map(
                                            (option) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            )}
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={includePublic ?? false}
                                    onChange={(e) =>
                                        setIncludePublic(e.target.checked)
                                    }
                                    disabled={!hasPrivateDataPlanes}
                                    size="small"
                                />
                            }
                            label="Allow public data planes"
                            slotProps={{
                                typography: {
                                    variant: 'body2',
                                },
                            }}
                        />

                        {dataPlaneSelectOptions.length > 1 && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectAdditional}
                                        onChange={(e) =>
                                            setValue(
                                                'select_additional',
                                                e.target.checked
                                            )
                                        }
                                        size="small"
                                    />
                                }
                                label="Select multiple data planes"
                                slotProps={{
                                    typography: {
                                        variant: 'body2',
                                    },
                                }}
                            />
                        )}
                    </Box>
                </Stack>
            </CardWrapper>

            <CardWrapper>
                <TextField
                    {...register('bucket', {
                        required: 'Bucket is required',
                    })}
                    // variant="outlined"
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
                <Stack
                    spacing={2}
                    sx={{ /* pl: 2, */ color: 'text.secondary' }}
                >
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
                                <Controller
                                    name="provider"
                                    control={control}
                                    rules={{ required: !useSameRegion && 'Provider is required' }}
                                    render={({ field }) => (
                                        <FormControl
                                            fullWidth
                                            size="small"
                                            required
                                            error={!!errors.provider}
                                        >
                                            <InputLabel>
                                                Cloud Provider
                                            </InputLabel>
                                            <Select
                                                {...field}
                                                label="Cloud Provider"
                                            >
                                                {PROVIDER_OPTIONS.map(
                                                    (option) => (
                                                        <MenuItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name="region"
                                    control={control}
                                    rules={{ required: !useSameRegion && 'Region is required' }}
                                    render={({ field }) => (
                                        <FormControl
                                            fullWidth
                                            size="small"
                                            required
                                            error={!!errors.region}
                                            disabled={!provider}
                                        >
                                            <InputLabel>Region</InputLabel>
                                            <Select {...field} label="Region">
                                                {regionOptions.map((option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
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
                                        {selectedDataPlane?.parsedName.provider
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
                                        {selectedDataPlane?.parsedName.region ??
                                            '—'}
                                    </TechnicalEmphasis>
                                </Box>
                            </Box>
                        </Fade>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={useSameRegion}
                                    onChange={(e) =>
                                        setValue('use_same_region', e.target.checked)
                                    }
                                    size="small"
                                />
                            }
                            label="Storage bucket and default data plane are in the same region"
                            slotProps={{
                                typography: {
                                    variant: 'body2',
                                },
                            }}
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
    );
}
