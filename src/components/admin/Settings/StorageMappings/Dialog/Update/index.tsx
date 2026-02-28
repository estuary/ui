import type {
    FragmentStore,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import DataPlanesCard from '../shared/DataPlanesCard';
import { ConnectionTests } from './NewConnectionTests';
import { StorageLocationsCard } from './StorageLocationsCard';
import {
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form';

import { DataPlaneNode, useDataPlanes } from 'src/api/dataPlanesGql';
import {
    useStorageMappings,
    useStorageMappingService,
} from 'src/api/storageMappingsGql';
import { toApiStore } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CardWrapper from 'src/components/shared/CardWrapper';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { useDialog } from 'src/hooks/useDialog';

interface MappingData {
    catalogPrefix: string;
    dataPlanes: DataPlaneNode[];
    stores: FragmentStore[];
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
    const { update } = useStorageMappingService();

    const {
        clear: clearConnectionTests,
        allTestsPassing,
        connections,
        testConnections,
        addDataPlane: connectToDp,
    } = useConnectionTest({
        dataPlanes: mapping.dataPlanes,
        stores: mapping.stores,
    });

    const initialTestTriggered = useRef(false);
    useEffect(() => {
        if (connections.length === 0) return;
        if (initialTestTriggered.current) return;
        initialTestTriggered.current = true;
        void testConnections(connections).catch(() => {});
    }, [connections, testConnections]);

    const refresh = useStorageMappingsRefresh();

    const { getValues, watch, setValue } =
        useFormContext<StorageMappingFormData>();
    const {
        append: appendDataPlane,
        remove: removeDataPlane,
        move: moveDataPlane,
    } = useFieldArray({
        name: 'data_planes',
        rules: {
            required: 'At least one data plane is required',
        },
    });
    const allowPublic = watch('allow_public');
    const dataPlanes = watch('data_planes');
    const fragmentStores = watch('fragment_stores');

    const selectDataPlane = useCallback(
        (dp: DataPlaneNode) => {
            appendDataPlane(dp);
            const connections = connectToDp(dp);
            testConnections(connections).catch(() => {});
        },
        [appendDataPlane, connectToDp, testConnections]
    );

    const handleClose = useCallback(() => {
        // Remove any unsaved stores (pending or newly added) before closing
        const stores = getValues('fragment_stores');
        const withoutUnsaved = stores.filter((s) => !s._isPending && !s._isNew);
        if (withoutUnsaved.length !== stores.length) {
            setValue('fragment_stores', withoutUnsaved);
        }
        initialTestTriggered.current = false;
        clearConnectionTests();
        onClose();
    }, [onClose, clearConnectionTests, getValues, setValue]);

    const hasPendingStore = useMemo(
        () => fragmentStores?.some((s) => s._isPending), // optional??
        [fragmentStores]
    );

    const hasChanges = useMemo(() => {
        const dpChanged =
            // default dp has changed
            dataPlanes[0]?.dataPlaneName !==
                mapping.dataPlanes[0]?.dataPlaneName ||
            // or any dp has been added
            dataPlanes.some(
                (dp) =>
                    !mapping.dataPlanes.some(
                        (d) => d.dataPlaneName === dp.dataPlaneName
                    )
            ) ||
            // or any dp has been removed
            mapping.dataPlanes.some(
                (dp) =>
                    !dataPlanes.some(
                        (d) => d.dataPlaneName === dp.dataPlaneName
                    )
            );
        // Length check is sufficient — the UI only supports adding stores, not editing existing ones
        const storesChanged = fragmentStores.length !== mapping.stores.length;
        return dpChanged || storesChanged;
    }, [
        dataPlanes,
        fragmentStores.length,
        mapping.stores.length,
        mapping.dataPlanes,
    ]);

    const save = async () => {
        const data = getValues();
        await update({
            catalogPrefix: data.catalog_prefix,
            spec: {
                stores: data.fragment_stores.map(toApiStore),
                data_planes: data.data_planes.map((dp) => dp.dataPlaneName),
            },
        });
        refresh();
        return true;
    };

    const title = useMemo(
        () => (
            <Typography variant="h6" component="span" fontWeight={600}>
                Storage for{' '}
                <TechnicalEmphasis>{mapping.catalogPrefix}</TechnicalEmphasis>
            </Typography>
        ),
        [mapping.catalogPrefix]
    );

    const steps = useMemo(
        () =>
            [
                {
                    title,
                    component: (
                        <>
                            <Typography sx={{ mb: 4 }}>
                                Update your data plane or collection storage
                                configuration below. For information and access
                                requirements, see the{' '}
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
                                            dataPlanes.length > 0
                                                ? dataPlanes[0]
                                                : null
                                        }
                                        allowPublicChecked={allowPublic}
                                        onSelect={selectDataPlane}
                                        // onRemove={remove}
                                        // onSelectDefault={(index) =>
                                        //     move(index, 0)
                                        // }
                                        onToggleAllowPublic={(value) =>
                                            setValue('allow_public', value)
                                        }
                                    />
                                </CardWrapper>
                                <CardWrapper>
                                    <StorageLocationsCard />
                                </CardWrapper>
                                <CardWrapper>
                                    <ConnectionTests />
                                </CardWrapper>
                            </Stack>
                        </>
                    ),
                    nextLabel: 'Save Changes',
                    canAdvance: () =>
                        dataPlanes.length > 0 &&
                        !hasPendingStore &&
                        allTestsPassing,
                    onAdvance: save,
                },
            ] satisfies WizardStep[],
        [dataPlanes, allTestsPassing, hasPendingStore, title]
    );

    return (
        <WizardDialog
            open={open}
            onClose={handleClose}
            steps={steps}
            showActions={hasChanges}
        />
    );
}

export function UpdateMappingWizard() {
    const { open, onClose, context } = useDialog('EDIT_STORAGE_MAPPING');
    const { storageMappings } = useStorageMappings();
    const { dataPlanes } = useDataPlanes();

    const prefix = context.prefix;

    const storageMapping = useMemo((): MappingData | null => {
        if (!prefix) return null;

        const mapping = storageMappings.find(
            (sm) => sm.catalogPrefix === prefix
        );
        if (!mapping) return null;

        return {
            catalogPrefix: mapping.catalogPrefix,
            dataPlanes: mapping.spec.data_planes
                .map((name: string) =>
                    dataPlanes.find((dp) => dp.dataPlaneName === name)
                )
                .filter((dp): dp is DataPlaneNode => dp !== undefined),
            stores: mapping.spec.stores,
        };
    }, [prefix, storageMappings, dataPlanes]);

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalog_prefix: storageMapping?.catalogPrefix,
            data_planes: storageMapping?.dataPlanes,
            fragment_stores: storageMapping?.stores ?? [],
            allow_public: true,
        },
    });

    if (!storageMapping) return null;

    return (
        <FormProvider {...methods}>
            <ConnectionTestProvider
                key={storageMapping.catalogPrefix}
                catalogPrefix={storageMapping.catalogPrefix}
            >
                <DialogInner
                    key={storageMapping.catalogPrefix}
                    mapping={storageMapping}
                    open={open}
                    onClose={onClose}
                />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
