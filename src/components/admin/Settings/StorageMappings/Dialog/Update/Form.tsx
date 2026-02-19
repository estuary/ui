import type {
    CloudProvider,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Box,
    CircularProgress,
    Collapse,
    Link,
    Stack,
    Typography,
} from '@mui/material';

import { CheckCircle } from 'iconoir-react';
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

    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [initiallyFailedKeys] = useState<Set<string>>(() => new Set());

    // Capture the original data plane names once hydrated (first non-empty set)
    const originalDataPlaneNamesRef = useRef<Set<string> | null>(null);
    if (originalDataPlaneNamesRef.current === null && dataPlanes.length > 0) {
        originalDataPlaneNamesRef.current = new Set(
            dataPlanes.map((dp) => dp.dataPlaneName)
        );
    }

    // Data planes that were in the original mapping but have been removed
    const deletedDataPlaneNames = useMemo(() => {
        if (!originalDataPlaneNamesRef.current) return new Set<string>();

        const currentNames = new Set(
            dataPlanes.map((dp) => dp.dataPlaneName)
        );

        const deleted = new Set<string>();
        for (const name of originalDataPlaneNamesRef.current) {
            if (!currentNames.has(name)) {
                deleted.add(name);
            }
        }
        return deleted;
    }, [dataPlanes]);

    // When a data plane is deleted, clean up its failed keys
    // useEffect(() => {
    //     for (const name of deletedDataPlaneNames) {
    //         for (const key of initiallyFailedKeys) {
    //             if (key.startsWith(`${name}-`)) {
    //                 initiallyFailedKeys.delete(key);
    //             }
    //         }
    //     }
    // }, [deletedDataPlaneNames, initiallyFailedKeys]);

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

    // Only true during the initial batch test, not individual retries
    const initialTestInProgress = useMemo(() => {
        return (
            initiallyFailedKeys.size === 0 &&
            [...results.values()].some((result) => result.status === 'testing')
        );
    }, [initiallyFailedKeys, results]);

    // Track keys that fail so they stay visible after retries pass
    useEffect(() => {
        for (const [[dataPlane, store], result] of results) {
            if (result.status === 'error') {
                initiallyFailedKeys.add(
                    `${dataPlane.dataPlaneName}-${store.bucket}`
                );
            }
        }
    }, [results, initiallyFailedKeys]);

    // Show entries that are currently failing OR were initially failing
    const visibleEntries = useMemo(
        () =>
            Array.from(results).filter(([[dataPlane, store], result]) => {
                const key = `${dataPlane.dataPlaneName}-${store.bucket}`;
                return (
                    result.status === 'error' || initiallyFailedKeys.has(key)
                );
            }),
        [results, initiallyFailedKeys]
    );

    return (
        <Stack>
            <Collapse
                in={initialTestInProgress}
                // unmountOnExit
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                        Testing connections…
                    </Typography>
                </Stack>
            </Collapse>
            <Collapse
                in={testsPassing && initiallyFailedKeys.size === 0}
                // unmountOnExit
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: 1,
                        borderColor: 'success.main',
                        borderRadius: 2,
                        px: 1,
                        py: 0.75,
                        color: 'success.main',
                    }}
                >
                    <CheckCircle width={20} height={20} />
                    <Typography variant="body2" fontWeight={600}>
                        All connections passing
                    </Typography>
                </Box>
            </Collapse>
            <Collapse
                in={visibleEntries.length > 0 && !initialTestInProgress}
                // unmountOnExit
            >
                <Stack spacing={1}>
                    {visibleEntries.map(([[dataPlane, store]]) => {
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
                                disabled={deletedDataPlaneNames.has(
                                    dataPlane.dataPlaneName
                                )}
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
