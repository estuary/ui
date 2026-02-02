import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { Box, Link, Stack, Typography, useTheme } from '@mui/material';

import { useConnectionTest } from './ConnectionTestContext';
import { useFormContext } from 'react-hook-form';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import { CloudProvider } from 'src/api/storageMappingsGql';
import { DataPlaneAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlaneAccordion';
import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

const docsAnchorMap: Record<string, string> = {
    [CloudProviderCodes.aws]: 'amazon-s3-buckets',
    [CloudProviderCodes.gcp]: 'google-cloud-storage-buckets',
    [CloudProviderCodes.azure]: 'azure-blob-storage',
};

const providerLabelmap: Record<string, string> = {
    [CloudProviderCodes.aws]: 'Amazon S3',
    [CloudProviderCodes.gcp]: 'Google Cloud Storage',
    [CloudProviderCodes.azure]: 'Azure Blob Storage',
};

export function TestConnectionResult() {
    const theme = useTheme();
    const { getValues } = useFormContext<StorageMappingFormData>();
    const formData = getValues();
    const { results } = useConnectionTest();

    const { dataPlanes: dataPlaneOptions } = useDataPlanes();

    // Derive provider, region for display (from primary data plane or form)
    const { provider, displayProvider, displayRegion } = useMemo(() => {
        const primaryDataPlane = formData.data_planes?.[0];
        const dataPlane = primaryDataPlane
            ? dataPlaneOptions.find(
                  (dp) => dp.dataPlaneName === primaryDataPlane.dataPlaneName
              )
            : undefined;

        if (formData.use_same_region && dataPlane) {
            return {
                provider: dataPlane.cloudProvider,
                displayProvider: providerLabelmap[dataPlane.cloudProvider],
                displayRegion: dataPlane.region,
            };
        }
        return {
            provider: formData.provider,
            displayProvider: providerLabelmap[formData.provider],
            displayRegion: formData.region,
        };
    }, [
        dataPlaneOptions,
        formData.use_same_region,
        formData.data_planes,
        formData.provider,
        formData.region,
    ]);

    return (
        <Stack spacing={3}>
            <Typography>
                Grant Estuary access to your storage bucket. For detailed
                instructions,
                <br /> see the{' '}
                <Link
                    href={docsBaseUrl + docsAnchorMap[provider]}
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
                {Array.from(results).map(([[dataPlane, store]]) => {
                    const provider = (
                        formData.use_same_region
                            ? dataPlane.cloudProvider
                            : store.provider
                    ) as CloudProvider;
                    return (
                        <DataPlaneAccordion
                            key={dataPlane.dataPlaneName}
                            dataPlane={dataPlane}
                            store={{
                                bucket: store.bucket,
                                provider,
                            }}
                        />
                    );
                })}
            </Stack>
        </Stack>
    );
}
