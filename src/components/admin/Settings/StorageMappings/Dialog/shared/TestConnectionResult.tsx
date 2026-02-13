import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo, useState } from 'react';

import { Box, Link, Stack, Typography, useTheme } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionAccordion';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import {
    CloudProvider,
    PROVIDER_LABELS,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { codeBackground } from 'src/context/Theme';

const docsBaseUrl = 'https://docs.estuary.dev/getting-started/installation/#';

const docsAnchorMap: Record<CloudProvider, string> = {
    AWS: 'amazon-s3-buckets',
    GCP: 'google-cloud-storage-buckets',
    AZURE: 'azure-blob-storage',
};

export function TestConnectionResult() {
    const theme = useTheme();
    const { getValues } = useFormContext<StorageMappingFormData>();
    const { results } = useConnectionTest();
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    const store = getValues().fragment_stores[0];

    const { provider, displayProvider, displayRegion } = useMemo(
        () => ({
            provider: store.provider,
            displayProvider: PROVIDER_LABELS[store.provider],
            displayRegion: store.region,
        }),
        [store.provider, store.region]
    );

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
                <TechnicalEmphasis>{store.bucket || '—'}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Provider:</strong>
                </Typography>
                <TechnicalEmphasis>{displayProvider}</TechnicalEmphasis>

                <Typography variant="body2">
                    <strong>Region:</strong>
                </Typography>
                <TechnicalEmphasis>{displayRegion}</TechnicalEmphasis>

                {store.storage_prefix ? (
                    <>
                        <Typography variant="body2">
                            <strong>Prefix:</strong>
                        </Typography>
                        <TechnicalEmphasis>
                            {store.storage_prefix}
                        </TechnicalEmphasis>
                    </>
                ) : null}
            </Box>

            <Stack spacing={1}>
                {Array.from(results).map(([[dataPlane, store]]) => {
                    const provider = store.provider as CloudProvider;
                    const key = `${dataPlane.dataPlaneName}-${store.bucket}`;
                    return (
                        <ConnectionAccordion
                            key={key}
                            dataPlane={dataPlane}
                            store={{
                                bucket: store.bucket,
                                provider,
                            }}
                            expanded={expandedKey === key}
                            onToggle={(isExpanded) =>
                                setExpandedKey(isExpanded ? key : null)
                            }
                        />
                    );
                })}
            </Stack>
        </Stack>
    );
}
