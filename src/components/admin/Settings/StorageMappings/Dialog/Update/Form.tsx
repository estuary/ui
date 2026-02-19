import type {
    CloudProvider,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useEffect, useMemo, useState } from 'react';

import {
    CircularProgress,
    Collapse,
    Link,
    Stack,
    Typography,
} from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import { useConnectionTest } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

function RunTests() {
    const { testAll, results, testsPassing } = useConnectionTest();
    const { watch } = useFormContext<StorageMappingFormData>();

    const dataPlanes = watch('data_planes');
    const fragmentStores = watch('fragment_stores');

    const [showFailing, setShowFailing] = useState(false);
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    useEffect(() => {
        if (
            results.size > 0 ||
            dataPlanes.length === 0 ||
            fragmentStores.length === 0
        ) {
            return;
        }

        const stores = fragmentStores.map((store) => ({
            bucket: store.bucket,
            provider: store.provider,
            prefix: store.storage_prefix || undefined,
        }));

        void testAll(dataPlanes, stores).catch(() => {
            // Error state is already reflected in results
        });
    }, [dataPlanes, fragmentStores, testAll, results.size]);

    const isTesting = useMemo(() => {
        if (results.size === 0) return dataPlanes.length > 0;
        return [...results.values()].some((r) => r.status === 'testing');
    }, [results, dataPlanes.length]);

    const failingEntries = useMemo(
        () =>
            Array.from(results).filter(
                ([, result]) => result.status === 'error'
            ),
        [results]
    );

    if (isTesting) {
        return (
            <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                    Testing connections…
                </Typography>
            </Stack>
        );
    }

    if (results.size === 0) return null;

    if (testsPassing) {
        return (
            <Typography variant="body2" color="success.main">
                All connections passing
            </Typography>
        );
    }

    return (
        <Stack spacing={1}>
            <Collapse in={!showFailing}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="error.main">
                        Some connection tests are failing
                    </Typography>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => setShowFailing((prev) => !prev)}
                    >
                        Show details
                    </Link>
                </Stack>
            </Collapse>

            <Collapse in={showFailing}>
                <Stack spacing={1}>
                    {failingEntries.map(([[dataPlane, store]]) => {
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
            </Collapse>
        </Stack>
    );
}

export function UpdateForm() {
    return (
        <>
            <Typography sx={{ mb: 4 }}>
                Update your data plane or collection storage configuration
                below. For information and access requirements, see the{' '}
                <Link
                    href="https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    documentation
                </Link>
                .
            </Typography>
            <Stack spacing={2}>
                <DataPlanesCard />
                <StorageLocationsCard />
                <CardWrapper disableMinWidth sx={{ overflow: 'hidden' }}>
                    <Typography sx={cardHeaderSx}>Connection Health</Typography>
                    <Typography>
                        Each data plane and storage location pair is
                        automatically tested for connectivity. New connections
                        must pass these tests before you can save your changes.
                    </Typography>
                    <RunTests />
                </CardWrapper>
            </Stack>
        </>
    );
}
