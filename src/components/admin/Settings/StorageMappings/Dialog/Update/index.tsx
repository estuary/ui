import type {
    CloudProvider,
    FormDataPlane,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import {
    storageProviderToCloudProvider,
    useStorageMappings,
    useStorageMappingService,
} from 'src/api/storageMappingsGql';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import { TestConnectionResult } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/TestConnectionResult';
import { UpdateForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/Form';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { useDialogParam } from 'src/hooks/searchParams/useDialogParam';

interface MappingData {
    catalog_prefix: string;
    storage: {
        data_planes: string[];
        stores: {
            bucket: string;
            provider: CloudProvider;
            storage_prefix?: string;
        }[];
    };
}

function DialogInner({
    mapping,
    open,
    onClose,
}: {
    mapping: MappingData;
    open: boolean;
    onClose: () => void;
}) {
    const { dataPlanes: allDataPlanes } = useDataPlanes();
    const { update } = useStorageMappingService();

    const { testAll, resultFor } = useConnectionTest();
    const refresh = useStorageMappingsRefresh();

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalog_prefix: mapping.catalog_prefix,
            data_planes: [],
            default_data_plane: null,
            fragment_stores: mapping.storage.stores,
            allow_public: true,
            select_additional: true,
        },
    });

    const { getValues, watch } = methods;

    const dataPlanes = watch('data_planes');
    const fragmentStores = watch('fragment_stores');

    const hasPendingStore = useMemo(
        () => fragmentStores.some((s) => s._isPending),
        [fragmentStores]
    );

    // Resolve data plane names to nodes once allDataPlanes loads
    const dataPlanesHydrated = useRef(false);
    useEffect(() => {
        if (!dataPlanesHydrated.current && allDataPlanes.length > 0) {
            dataPlanesHydrated.current = true;
            const resolved = mapping.storage.data_planes
                .map((name) =>
                    allDataPlanes.find((dp) => dp.dataPlaneName === name)
                )
                .filter((dp): dp is FormDataPlane => dp !== undefined);
            methods.setValue('data_planes', resolved, { shouldDirty: false });
        }
    }, [allDataPlanes, mapping.storage.data_planes, methods]);

    const hasChanges = useMemo(() => {
        const dpChanged =
            dataPlanes[0]?.dataPlaneName !== mapping.storage.data_planes[0] ||
            dataPlanes.length !== mapping.storage.data_planes.length ||
            dataPlanes.some(
                (dp) => !mapping.storage.data_planes.includes(dp.dataPlaneName)
            );
        const storesChanged =
            fragmentStores.length !== mapping.storage.stores.length;
        return dpChanged || storesChanged;
    }, [dataPlanes, fragmentStores.length, mapping.storage]);

    const newConnectionsPassing = useMemo(() => {
        const newDataPlanes = dataPlanes.filter((dp) => dp._isNew);
        const newStores = fragmentStores.filter((s) => s._isNew);

        // Collect all pairs that involve at least one new element
        const newPairs: [FormDataPlane, (typeof fragmentStores)[number]][] = [];
        for (const dp of newDataPlanes) {
            for (const store of fragmentStores) {
                newPairs.push([dp, store]);
            }
        }
        for (const dp of dataPlanes.filter((dp) => !dp._isNew)) {
            for (const store of newStores) {
                newPairs.push([dp, store]);
            }
        }

        if (newPairs.length === 0) return true;

        return newPairs.every(
            ([dp, store]) => resultFor(dp, store).status === 'success'
        );
    }, [dataPlanes, fragmentStores, resultFor]);

    const handleTestConnections = useCallback(async (): Promise<boolean> => {
        const stores = fragmentStores.map((store) => ({
            bucket: store.bucket,
            provider: store.provider,
            prefix: store.storage_prefix || undefined,
        }));
        await testAll(dataPlanes, stores);
        return true;
    }, [fragmentStores, testAll, dataPlanes]);

    const handleSave = async () => {
        const data = getValues();
        const stores = data.fragment_stores.map((store) => ({
            bucket: store.bucket,
            provider: store.provider,
            prefix: store.storage_prefix || undefined,
        }));
        await update({
            catalogPrefix: data.catalog_prefix,
            storage: {
                stores,
                data_planes: data.data_planes.map((dp) => dp.dataPlaneName),
            },
        });
        refresh();
        onClose();
    };

    const title = useMemo(
        () => (
            <Typography variant="h6" component="span" fontWeight={600}>
                Storage for{' '}
                <TechnicalEmphasis>{mapping.catalog_prefix}</TechnicalEmphasis>
            </Typography>
        ),
        [mapping.catalog_prefix]
    );

    const steps = useMemo(
        () =>
            [
                {
                    title,
                    component: <UpdateForm />,
                    nextLabel: 'Test connections',
                    canAdvance: () => dataPlanes.length > 0 && !hasPendingStore,
                    onAdvance: handleTestConnections,
                },
                {
                    title,
                    component: <TestConnectionResult />,
                    nextLabel: 'Save Changes',
                    canAdvance: () => newConnectionsPassing,
                },
            ] satisfies WizardStep[],
        [
            dataPlanes,
            handleTestConnections,
            newConnectionsPassing,
            hasPendingStore,
            title,
        ]
    );

    return (
        <FormProvider {...methods}>
            <WizardDialog
                open={open}
                onClose={onClose}
                steps={steps}
                onComplete={handleSave}
                showActions={hasChanges}
            />
        </FormProvider>
    );
}

const CONTEXT_PARAMS = ['prefix'];

export function UpdateMappingWizard() {
    const { open, onClose, searchParams } = useDialogParam(
        'edit-storage-mapping',
        CONTEXT_PARAMS
    );
    const { storageMappings } = useStorageMappings();

    const prefix = searchParams.get('prefix');

    const mapping = useMemo((): MappingData | null => {
        if (!prefix) return null;

        const match = storageMappings.find(
            (sm) => sm.catalogPrefix === prefix
        );
        if (!match) return null;

        return {
            catalog_prefix: match.catalogPrefix,
            storage: {
                data_planes: match.storage.data_planes,
                stores: match.storage.stores.map((store) => ({
                    bucket: store.bucket,
                    provider: storageProviderToCloudProvider(store.provider),
                    storage_prefix: store.prefix,
                })),
            },
        };
    }, [prefix, storageMappings]);

    // Preserve mapping during exit animation so dialog content doesn't disappear
    const lastMapping = useRef(mapping);
    if (mapping) lastMapping.current = mapping;

    const displayMapping = mapping ?? lastMapping.current;

    if (!displayMapping) return null;

    return (
        <ConnectionTestProvider catalog_prefix={displayMapping.catalog_prefix}>
            <DialogInner
                key={displayMapping.catalog_prefix}
                mapping={displayMapping}
                open={open}
                onClose={onClose}
            />
        </ConnectionTestProvider>
    );
}
