import type { SxProps, Theme } from '@mui/material';
import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Collapse, Link, Stack } from '@mui/material';

import { useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { storeValidation } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageFields/StorageValidation';
import {
    RHFAutocomplete,
    RHFSelect,
    RHFTextField,
} from 'src/components/shared/RHFFields/';
import { AWS_REGIONS, PROVIDER_LABELS } from 'src/utils/cloudRegions';
import { appendWithForwardSlash } from 'src/utils/misc-utils';

const PROVIDER_OPTIONS = (Object.keys(PROVIDER_LABELS) as CloudProvider[]).map(
    (code) => ({
        value: code,
        label: PROVIDER_LABELS[code],
    })
);

interface StorageFieldsProps {
    defaultDataPlane: DataPlaneNode | null;
    sx?: SxProps<Theme>;
}

const PENDING_STORE_INDEX = 0 as const;
export function StorageFields({
    defaultDataPlane = null,
    sx,
}: StorageFieldsProps) {
    const intl = useIntl();
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
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.storageFields.mismatchWarning',
                    })}{' '}
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => setTrackDefaultDp(true)}
                    >
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.storageFields.matchDefault',
                        })}
                    </Link>
                </Alert>
            </Collapse>
            <Stack direction="row" spacing={1}>
                <RHFSelect<StorageMappingFormData>
                    key="provider"
                    name={`fragmentStores.${PENDING_STORE_INDEX}.provider`}
                    label={intl.formatMessage({
                        id: 'storageMappings.dialog.storageFields.cloudProvider',
                    })}
                    options={PROVIDER_OPTIONS}
                    required
                    rules={{
                        required: intl.formatMessage({
                            id: 'storageMappings.dialog.storageFields.validation.cloudProviderRequired',
                        }),
                    }}
                    onUserSelect={() => setTrackDefaultDp(false)}
                />
                {storeProvider === 'AWS' ? (
                    <RHFAutocomplete<StorageMappingFormData>
                        key="region"
                        name={`fragmentStores.${PENDING_STORE_INDEX}.region`}
                        label={intl.formatMessage({
                            id: 'storageMappings.dialog.storageFields.region',
                        })}
                        options={awsRegionOptions}
                        required
                        disabled={!storeProvider}
                        rules={{
                            required: intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.validation.regionRequired',
                            }),
                        }}
                        onUserSelect={() => setTrackDefaultDp(false)}
                    />
                ) : null}
            </Stack>
            <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                <Collapse in={storeProvider === 'AZURE'} unmountOnExit>
                    <Stack direction="row" spacing={2}>
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.accountTenantId`}
                            label={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.accountTenantId',
                            })}
                            required
                            progressiveRules={
                                storeValidation.azureAccountTenantId
                            }
                        />
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.storageAccountName`}
                            label={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.storageAccountName',
                            })}
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
                            label={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.containerName',
                            })}
                            required
                            helperText={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.bucketHelperText',
                            })}
                            progressiveRules={
                                storeValidation.azureContainerName
                            }
                        />
                    ) : (
                        <RHFTextField<StorageMappingFormData>
                            name={`fragmentStores.${PENDING_STORE_INDEX}.bucket`}
                            label={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.bucket',
                            })}
                            required
                            helperText={intl.formatMessage({
                                id: 'storageMappings.dialog.storageFields.bucketHelperText',
                            })}
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
                        label={intl.formatMessage({
                            id: 'storageMappings.dialog.storageFields.storagePrefix',
                        })}
                        helperText={intl.formatMessage({
                            id: 'storageMappings.dialog.storageFields.storagePrefixHelperText',
                        })}
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
