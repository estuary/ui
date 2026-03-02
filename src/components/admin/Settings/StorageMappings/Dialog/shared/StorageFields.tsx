import type { SxProps, Theme } from '@mui/material';
import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Collapse, Link, Stack } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { storeValidation } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/StorageValidation';
import { RHFSelect, RHFTextField } from 'src/components/shared/RHFFields/';
import { AWS_REGIONS, PROVIDER_LABELS } from 'src/utils/cloudRegions';
import { appendWithForwardSlash } from 'src/utils/misc-utils';

export const PROVIDER_OPTIONS = (
    Object.keys(PROVIDER_LABELS) as CloudProvider[]
).map((code) => ({
    value: code,
    label: PROVIDER_LABELS[code],
}));

interface StorageFieldsProps {
    defaultDataPlane: DataPlaneNode | null;
    sx?: SxProps<Theme>;
}

const PENDING_STORE_INDEX = 0 as const;
export function StorageFields({
    defaultDataPlane = null,
    sx,
}: StorageFieldsProps) {
    const { watch, setValue } = useFormContext<StorageMappingFormData>();

    const storeProvider = watch(
        `fragmentStores.${PENDING_STORE_INDEX}.provider`
    );
    const storeRegion = watch(`fragmentStores.${PENDING_STORE_INDEX}.region`);

    const [trackDefaultDp, setTrackDefaultDp] = useState(
        !storeProvider && !storeRegion
    );

    useEffect(() => {
        // if we're tracking the default data plane, update the form values to match when the default data plane changes
        if (!trackDefaultDp || !defaultDataPlane) {
            return;
        }
        setValue(
            `fragmentStores.${PENDING_STORE_INDEX}.provider`,
            defaultDataPlane.cloudProvider
        );
        setValue(
            `fragmentStores.${PENDING_STORE_INDEX}.region`,
            defaultDataPlane.region
        );
    }, [defaultDataPlane, trackDefaultDp, setValue]);

    const awsRegionOptions = useMemo(
        () =>
            Object.keys(AWS_REGIONS)
                .sort()
                .map((region) => ({ value: region, label: region })),
        []
    );

    const mismatch = useMemo(() => {
        if (!defaultDataPlane || (!storeProvider && !storeRegion)) {
            return false;
        }

        if (defaultDataPlane.cloudProvider !== storeProvider) return true;

        if (
            storeProvider === 'AWS' &&
            defaultDataPlane.region !== storeRegion
        ) {
            return true;
        }

        return false;
    }, [defaultDataPlane, storeProvider, storeRegion]);

    const showMismatchWarning = mismatch && !!defaultDataPlane;

    return (
        <Stack spacing={2} sx={sx}>
            <Collapse in={showMismatchWarning}>
                <Alert severity="warning">
                    The selected cloud provider / region do not match the
                    default data plane. This may result in additional egress
                    fees.{' '}
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => setTrackDefaultDp(true)}
                    >
                        Match default data plane
                    </Link>
                </Alert>
            </Collapse>
            <Stack direction="row" spacing={1}>
                <RHFSelect<StorageMappingFormData>
                    key="provider"
                    name={`fragmentStores.${PENDING_STORE_INDEX}.provider`}
                    label="Cloud Provider"
                    options={PROVIDER_OPTIONS}
                    required
                    rules={{ required: 'Cloud provider is required' }}
                    onUserSelect={() => setTrackDefaultDp(false)}
                />
                {storeProvider === 'AWS' ? (
                    <RHFSelect<StorageMappingFormData>
                        key="region"
                        name={`fragmentStores.${PENDING_STORE_INDEX}.region`}
                        label="Region"
                        options={awsRegionOptions}
                        required
                        disabled={!storeProvider}
                        rules={{ required: 'Region is required' }}
                        onUserSelect={() => setTrackDefaultDp(false)}
                    />
                ) : null}
            </Stack>
            <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                <Collapse in={storeProvider === 'AZURE'} unmountOnExit>
                    <Stack direction="row" spacing={2}>
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.accountTenantId`}
                            label="Account Tenant ID"
                            required
                            progressiveRules={
                                storeValidation.azureAccountTenantId
                            }
                        />
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.storageAccountName`}
                            label="Storage Account Name"
                            required
                            progressiveRules={
                                storeValidation.azureStorageAccountName
                            }
                        />
                    </Stack>
                </Collapse>
                <Stack direction="row" spacing={2}>
                    {storeProvider === 'AZURE' ? (
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.containerName`}
                            label="Container Name"
                            required
                            helperText="Destination for Estuary collection data"
                            progressiveRules={
                                storeValidation.azureContainerName
                            }
                        />
                    ) : (
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.bucket`}
                            label="Bucket"
                            required
                            helperText="Destination for Estuary collection data"
                            progressiveRules={
                                storeProvider === 'AWS'
                                    ? storeValidation.awsBucket
                                    : storeProvider === 'GCP'
                                      ? storeValidation.gcpBucket
                                      : undefined
                            }
                        />
                    )}
                    <RHFTextField<StorageMappingFormData>
                        name={`fragmentStores.${PENDING_STORE_INDEX}.storagePrefix`}
                        label="Storage Prefix"
                        helperText="Optional prefix of keys written to the bucket"
                        onBlurTransform={(value) =>
                            !!value && !value.endsWith('/')
                                ? appendWithForwardSlash(value)
                                : value
                        }
                        progressiveRules={storeValidation.storagePrefix}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}
