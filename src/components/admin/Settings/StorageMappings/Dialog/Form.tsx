import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo } from 'react';

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

import { DataPlaneNode, useDataPlanes } from 'src/api/dataPlanesGql';
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
    toPresentableCloudProvider,
    toPresentableName,
} from 'src/utils/dataPlane-utils';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

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
    const { dataPlanes: allDataPlanes } = useDataPlanes();

    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    const selectedDataPlanes = watch('data_planes');
    const provider = watch('provider');
    const selectAdditional = watch('select_additional');
    const useSameRegion = watch('use_same_region');
    const allowPublic = watch('allow_public');
    const regionOptions = useMemo(() => getRegionOptions(provider), [provider]);

    const [hasPrivate, hasPublic] = useMemo(
        () => [
            allDataPlanes.some((option) => option.isPrivate),
            allDataPlanes.some((option) => !option.isPrivate),
        ],
        [allDataPlanes]
    );

    // Auto-select "allow public" if there are no private options
    // (Checkbox will be hidden if there are no public options)
    useEffect(() => {
        setValue('allow_public', !hasPrivate);
    }, [hasPrivate, setValue]);

    // Remove public data planes when allowPublic is unchecked
    useEffect(() => {
        if (!allowPublic && selectedDataPlanes.some((dp) => !dp.isPrivate)) {
            setValue(
                'data_planes',
                selectedDataPlanes.filter((dp) => dp.isPrivate)
            );
        }
    }, [allowPublic, selectedDataPlanes, setValue]);

    const filteredDataPlanes = useMemo(
        () =>
            allDataPlanes
                .filter((option) => {
                    // if we only have private OR public, show all options
                    if (hasPrivate != hasPublic) {
                        return true;
                    }
                    return option.isPrivate || allowPublic;
                })
                .sort((a, b) => {
                    // Private data planes first, then alphabetically
                    if (a.isPrivate !== b.isPrivate) {
                        return a.isPrivate ? -1 : 1;
                    }

                    return a.dataPlaneName.localeCompare(b.dataPlaneName);
                })
                .map((option) => ({
                    value: option.dataPlaneName,
                    label: `${toPresentableName(option)} (${option.scope})`,
                })),
        [allDataPlanes, hasPrivate, allowPublic]
    );

    // Convert a data plane name to a DataPlane object
    const nameToDataPlane = useCallback(
        (name: string): DataPlaneNode | null =>
            allDataPlanes.find((opt) => opt.dataPlaneName === name) ?? null,

        [allDataPlanes]
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
                        {filteredDataPlanes.length > 1 && selectAdditional ? (
                            <RHFMultiSelectWithDefault<
                                StorageMappingFormData,
                                'data_planes'
                            >
                                name="data_planes"
                                label="Data Planes"
                                options={filteredDataPlanes}
                                required
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) &&
                                            value.length > 0) ||
                                        'At least one data plane is required',
                                }}
                                valueTransform={(value) =>
                                    value?.map((dp) => dp.dataPlaneName) ?? []
                                }
                                onChangeTransform={(names) =>
                                    names
                                        .map(nameToDataPlane)
                                        .filter(
                                            (dp): dp is DataPlaneNode =>
                                                dp !== null
                                        )
                                }
                            />
                        ) : (
                            <RHFSelect<StorageMappingFormData, 'data_planes'>
                                name="data_planes"
                                label="Data Plane"
                                options={filteredDataPlanes}
                                required
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) &&
                                            value.length > 0) ||
                                        'Data plane is required',
                                }}
                                valueTransform={(value) =>
                                    value?.[0]?.dataPlaneName ?? ''
                                }
                                onChangeTransform={(name) => {
                                    const dp = nameToDataPlane(name as string);
                                    return dp ? [dp] : [];
                                }}
                            />
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                color: 'text.secondary',
                            }}
                        >
                            {hasPublic ? (
                                <RHFCheckbox<StorageMappingFormData>
                                    name="allow_public"
                                    label="Allow public data planes"
                                    // disabled because this will be checked by default
                                    // if there are no private options
                                    disabled={!hasPrivate}
                                />
                            ) : null}
                            {filteredDataPlanes.length > 1 ? (
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
                                            {selectedDataPlanes[0]?.region ??
                                                '—'}
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
