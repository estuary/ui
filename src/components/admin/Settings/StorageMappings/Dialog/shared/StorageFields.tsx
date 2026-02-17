import type {
    FormDataPlane,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Box, Collapse, Link, Stack, TextField } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import {
    CloudProvider,
    fragmentStoreValidation,
    PROVIDER_LABELS,
    RegionMap,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import { RHFSelect } from 'src/components/shared/forms/RHFSelect';

export const PROVIDER_OPTIONS = (
    Object.keys(PROVIDER_LABELS) as CloudProvider[]
).map((code) => ({
    value: code,
    label: PROVIDER_LABELS[code],
}));

export const getRegionOptions = (provider: CloudProvider) =>
    RegionMap[provider].map((region) => ({ value: region, label: region }));

interface StorageFieldsProps {
    index: number;
}

export function StorageFields({ index }: StorageFieldsProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<StorageMappingFormData>();

    const defaultDataPlane = watch('default_data_plane');
    // const fragmentStores = watch('fragment_stores');
    const provider = watch(`fragment_stores.${index}.provider`);
    const region = watch(`fragment_stores.${index}.region`);

    const [trackDataPlane, setTrackDataPlane] = useState(!provider && !region);

    const syncWithDataPlane = useCallback(
        (dataPlane: FormDataPlane) => {
            setValue(
                `fragment_stores.${index}.provider`,
                dataPlane.cloudProvider
            );
            setValue(`fragment_stores.${index}.region`, dataPlane.region);
        },
        [index, setValue]
    );

    useEffect(() => {
        if (!trackDataPlane || !defaultDataPlane) {
            return;
        }
        syncWithDataPlane(defaultDataPlane);
    }, [defaultDataPlane, trackDataPlane, syncWithDataPlane]);

    const storeErrors = errors.fragment_stores?.[index];

    const regionOptions = useMemo(
        // provider is not typed as nullable, but it will be undefined when the form is first rendered so we have to account for that case here
        () => (provider ? getRegionOptions(provider) : []),
        [provider]
    );

    const mismatch = useMemo(() => {
        if (!defaultDataPlane || (!provider && !region)) {
            return false;
        }

        return (
            defaultDataPlane.cloudProvider !== provider ||
            defaultDataPlane.region !== region
        );
    }, [defaultDataPlane, provider, region]);

    return (
        <Stack spacing={2} sx={{}}>
            <TextField
                {...register(
                    `fragment_stores.${index}.bucket`,
                    fragmentStoreValidation.bucket
                )}
                required
                label="Bucket"
                error={!!storeErrors?.bucket}
                helperText={
                    storeErrors?.bucket?.message ??
                    'Bucket into which Estuary will store data'
                }
                fullWidth
                size="small"
            />
            <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <RHFSelect<
                        StorageMappingFormData,
                        `fragment_stores.${number}.provider`
                    >
                        name={`fragment_stores.${index}.provider`}
                        label="Cloud Provider"
                        options={PROVIDER_OPTIONS}
                        required
                        rules={fragmentStoreValidation.provider}
                        onUserSelect={() => {
                            setValue(`fragment_stores.${index}.region`, '');
                            setTrackDataPlane(false);
                        }}
                    />

                    <RHFSelect<
                        StorageMappingFormData,
                        `fragment_stores.${number}.region`
                    >
                        name={`fragment_stores.${index}.region`}
                        label="Region"
                        options={regionOptions}
                        required
                        disabled={!provider}
                        rules={fragmentStoreValidation.region}
                        onUserSelect={() => setTrackDataPlane(false)}
                    />
                </Box>

                <Collapse in={mismatch && !!defaultDataPlane}>
                    <Alert severity="warning">
                        The selected cloud provider / region do not match the
                        default data plane. This may result in additional egress
                        fees.{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => {
                                setTrackDataPlane(true);
                                syncWithDataPlane(defaultDataPlane!);
                            }}
                        >
                            Match default data plane
                        </Link>
                    </Alert>
                </Collapse>

                <TextField
                    {...register(`fragment_stores.${index}.storage_prefix`)}
                    label="Storage Prefix"
                    fullWidth
                    size="small"
                    helperText="Optional prefix of keys written to the bucket"
                />
            </Stack>
        </Stack>
    );
}
