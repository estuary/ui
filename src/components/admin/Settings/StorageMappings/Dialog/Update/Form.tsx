import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

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
import { useFieldArray, useFormContext } from 'react-hook-form';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import DataPlanesCard from 'src/components/admin/Settings/StorageMappings/Dialog/shared/DataPlanesCard';
import { NewConnectionTests } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/NewConnectionTests';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

function TestConnections() {
    const {
        testConnections,
        activeConnections,
        orphanedOriginalConnections,
        isOriginalConnection,
        dataPlanes: contextDataPlanes,
        stores: contextStores,
    } = useConnectionTest();

    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [initiallyFailedKeys] = useState<Set<string>>(() => new Set());

    // Cache endpoint objects so they remain available after removal from maps
    const dpCacheRef = useRef<Map<string, DataPlaneNode>>(new Map());
    const storeCacheRef = useRef<Map<string, FragmentStore>>(new Map());

    useEffect(() => {
        for (const dp of contextDataPlanes) {
            dpCacheRef.current.set(dp.dataPlaneName, dp);
        }
    }, [contextDataPlanes]);

    useEffect(() => {
        for (const store of contextStores) {
            storeCacheRef.current.set(getStoreId(store), store);
        }
    }, [contextStores]);

    // Only original active connections belong in this card
    const existingActiveConnections = useMemo(
        () => activeConnections.filter((c) => isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );

    // Auto-test existing connections once after hydration
    const initialTestTriggered = useRef(false);
    useEffect(() => {
        if (initialTestTriggered.current) return;
        if (existingActiveConnections.length === 0) return;

        initialTestTriggered.current = true;
        void testConnections(existingActiveConnections).catch(() => {
            // Error state is already reflected in connections
        });
    }, [existingActiveConnections, testConnections]);

    // Only true during the initial batch test, not individual retries
    const initialTestInProgress = useMemo(() => {
        return (
            initiallyFailedKeys.size === 0 &&
            existingActiveConnections.some((c) => c.status === 'testing')
        );
    }, [initiallyFailedKeys, existingActiveConnections]);

    // Track keys that fail so they stay visible after retries pass
    useEffect(() => {
        for (const connection of existingActiveConnections) {
            if (connection.status === 'error') {
                initiallyFailedKeys.add(
                    `${connection.dataPlaneName}-${connection.storeId}`
                );
            }
        }
    }, [existingActiveConnections, initiallyFailedKeys]);

    const existingAllPassing = useMemo(
        () =>
            existingActiveConnections.length > 0 &&
            existingActiveConnections.every((c) => c.status === 'success'),
        [existingActiveConnections]
    );

    // Show entries that are currently failing OR were initially failing
    const visibleEntries = useMemo(
        () =>
            existingActiveConnections.filter((connection) => {
                const key = `${connection.dataPlaneName}-${connection.storeId}`;
                return (
                    connection.status === 'error' ||
                    initiallyFailedKeys.has(key)
                );
            }),
        [existingActiveConnections, initiallyFailedKeys]
    );

    return (
        <Stack>
            <Collapse in={initialTestInProgress}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                        Testing connections…
                    </Typography>
                </Stack>
            </Collapse>
            <Collapse in={existingAllPassing && initiallyFailedKeys.size === 0}>
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
            <Collapse in={visibleEntries.length > 0 && !initialTestInProgress}>
                <Stack spacing={1}>
                    {visibleEntries.map((connection) => {
                        const dataPlane = contextDataPlanes.find(
                            (dp) =>
                                dp.dataPlaneName === connection.dataPlaneName
                        );
                        const store = contextStores.find(
                            (s) => getStoreId(s) === connection.storeId
                        );
                        if (!dataPlane || !store) return null;

                        const key = `${connection.dataPlaneName}-${connection.storeId}`;
                        return (
                            <ConnectionAccordion
                                key={key}
                                dataPlane={dataPlane}
                                store={store}
                                expanded={expandedKey === key}
                                onToggle={(isExpanded) =>
                                    setExpandedKey(isExpanded ? key : null)
                                }
                            />
                        );
                    })}
                </Stack>
            </Collapse>
            <Collapse in={orphanedOriginalConnections.length > 0}>
                <Stack spacing={1} sx={{ mt: 1 }}>
                    {orphanedOriginalConnections.map((connection) => {
                        const dataPlane = dpCacheRef.current.get(
                            connection.dataPlaneName
                        );
                        const store = storeCacheRef.current.get(
                            connection.storeId
                        );
                        if (!dataPlane || !store) return null;

                        const key = `orphaned-${connection.dataPlaneName}-${connection.storeId}`;
                        return (
                            <ConnectionAccordion
                                key={key}
                                dataPlane={dataPlane}
                                store={store}
                                expanded={false}
                                onToggle={() => {}}
                                disabled
                            />
                        );
                    })}
                </Stack>
            </Collapse>
        </Stack>
    );
}

export function UpdateForm() {
    const { watch, setValue } = useFormContext<StorageMappingFormData>();
    const { append, remove, move } = useFieldArray({
        name: 'data_planes',
    });
    const dataPlanes = watch('data_planes');
    const allowPublic = watch('allow_public');

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
                <CardWrapper>
                    <DataPlanesCard
                        dataPlanes={dataPlanes}
                        defaultDataPlane={
                            dataPlanes.length > 0 ? dataPlanes[0] : null
                        }
                        allowPublicChecked={allowPublic}
                        onSelect={append}
                        onRemove={remove}
                        onSelectDefault={(index) => move(index, 0)}
                        onToggleAllowPublic={(value) =>
                            setValue('allow_public', value)
                        }
                    />
                </CardWrapper>
                <CardWrapper>
                    <StorageLocationsCard />
                </CardWrapper>
                <NewConnectionTests />

                <CardWrapper disableMinWidth sx={{ overflow: 'hidden' }}>
                    <Typography sx={cardHeaderSx}>
                        Existing Connections
                    </Typography>
                    <Typography>
                        Storage locations are periodically tested by each data
                        plane to ensure connectivity. Tasks will fail if any of
                        these connections are lost.
                    </Typography>
                    <TestConnections />
                </CardWrapper>
            </Stack>
        </>
    );
}
