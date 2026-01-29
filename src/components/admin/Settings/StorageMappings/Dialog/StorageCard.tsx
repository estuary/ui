import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { Box, Fade, Stack, TextField, Tooltip } from '@mui/material';

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
import { RHFSelect } from 'src/components/shared/forms/RHFSelect';
import { toPresentableCloudProvider } from 'src/utils/dataPlane-utils';

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

export function StorageCard() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    const selectedDataPlanes = watch('data_planes');
    const provider = watch('provider');
    const useSameRegion = watch('use_same_region');

    const regionOptions = useMemo(() => getRegionOptions(provider), [provider]);

    return (
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
                            <RHFSelect<StorageMappingFormData, 'provider'>
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

                            <RHFSelect<StorageMappingFormData, 'region'>
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
                                    {selectedDataPlanes[0]
                                        ? toPresentableCloudProvider(
                                              selectedDataPlanes[0]
                                          )
                                        : '—'}
                                </TechnicalEmphasis>
                            </Box>
                            <Box sx={{ typography: 'body2' }}>
                                <strong>Region:</strong>{' '}
                                <TechnicalEmphasis>
                                    {selectedDataPlanes[0]?.region ?? '—'}
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
    );
}
