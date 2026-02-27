import type {
    FormDataPlane,
    FragmentStore,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import {
    storageProviderToCloudProvider,
    useStorageMappings,
    useStorageMappingService,
} from 'src/api/storageMappingsGql';
import { toApiStore } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import { UpdateForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/Form';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { useDialog } from 'src/hooks/useDialog';

interface GCSFields {
    bucket: string;
}

interface AzureFields {
    container_name: string;
    storage_account_name: string;
    account_tenant_id: string;
}

interface AWSFields {
    bucket: string;
    region: string;
}

interface CommonStoreFields {
    storage_prefix?: string;
}

type StoreEntry =
    | ({ provider: 'GCP' } & GCSFields & CommonStoreFields)
    | ({ provider: 'AWS' } & AWSFields & CommonStoreFields)
    | ({ provider: 'AZURE' } & AzureFields & CommonStoreFields);

function toFragmentStore(store: StoreEntry): FragmentStore {
    switch (store.provider) {
        case 'GCP':
            return {
                provider: store.provider,
                bucket: store.bucket,
                region: '',
                storage_prefix: store.storage_prefix,
            };
        case 'AWS':
            return {
                provider: store.provider,
                bucket: store.bucket,
                region: store.region,
                storage_prefix: store.storage_prefix,
            };
        case 'AZURE':
            return {
                provider: store.provider,
                bucket: '',
                region: '',
                storage_prefix: store.storage_prefix,
                container_name: store.container_name,
                storage_account_name: store.storage_account_name,
                account_tenant_id: store.account_tenant_id,
            };
    }
}

interface MappingData {
    catalog_prefix: string;
    spec: {
        data_planes: string[];
        stores: StoreEntry[];
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

    const originalStores = useMemo(
        () => mapping.spec.stores.map(toFragmentStore),
        [mapping.spec.stores]
    );

    // Resolve original data plane names to full nodes once allDataPlanes loads
    const [resolvedOriginalDPs, setResolvedOriginalDPs] = useState<
        FormDataPlane[] | undefined
    >();
    const originalsResolved = useRef(false);
    useEffect(() => {
        if (originalsResolved.current || allDataPlanes.length === 0) return;
        originalsResolved.current = true;

        const resolved = mapping.spec.data_planes
            .map((name) =>
                allDataPlanes.find((dp) => dp.dataPlaneName === name)
            )
            .filter((dp): dp is FormDataPlane => dp !== undefined);
        setResolvedOriginalDPs(resolved);
    }, [allDataPlanes, mapping.spec.data_planes]);

    const {
        syncEndpoints,
        activeConnections,
        isOriginalConnection,
        clear: clearConnectionTests,
    } = useConnectionTest({
        dataPlanes: resolvedOriginalDPs ?? [],
        stores: originalStores,
    });
    const refresh = useStorageMappingsRefresh();

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalog_prefix: mapping.catalog_prefix,
            data_planes: [],
            fragment_stores: originalStores,
            allow_public: true,
        },
    });

    const { getValues, watch } = methods;

    const handleClose = useCallback(() => {
        // Remove any pending (unsaved) stores before closing
        const stores = methods.getValues('fragment_stores');
        const withoutPending = stores.filter((s) => !s._isPending);
        if (withoutPending.length !== stores.length) {
            methods.setValue('fragment_stores', withoutPending);
        }
        clearConnectionTests();
        originalsResolved.current = false;
        setResolvedOriginalDPs(undefined);
        onClose();
    }, [methods, onClose, clearConnectionTests]);

    const dataPlanes = watch('data_planes');
    const fragmentStores = watch('fragment_stores');

    const hasPendingStore = useMemo(
        () => fragmentStores.some((s) => s._isPending),
        [fragmentStores]
    );

    // Set form data planes once originals are resolved
    useEffect(() => {
        if (!resolvedOriginalDPs) return;
        methods.setValue('data_planes', resolvedOriginalDPs, {
            shouldDirty: false,
        });
    }, [resolvedOriginalDPs, methods]);

    // Sync form state into the connection test context on changes
    useEffect(() => {
        if (!resolvedOriginalDPs) return;
        const confirmedStores = fragmentStores.filter((s) => !s._isPending);
        syncEndpoints(dataPlanes, confirmedStores);
    }, [resolvedOriginalDPs, dataPlanes, fragmentStores, syncEndpoints]);

    const hasChanges = useMemo(() => {
        const dpChanged =
            // default dp has changed
            dataPlanes[0]?.dataPlaneName !== mapping.spec.data_planes[0] ||
            // or any dp has been added
            dataPlanes.some(
                (dp) => !mapping.spec.data_planes.includes(dp.dataPlaneName)
            ) ||
            // or any dp has been removed
            mapping.spec.data_planes.some(
                (dp) => !dataPlanes.some((d) => d.dataPlaneName === dp)
            );
        // Length check is sufficient — the UI only supports adding stores, not editing existing ones
        const storesChanged =
            fragmentStores.length !== mapping.spec.stores.length;
        return dpChanged || storesChanged;
    }, [dataPlanes, fragmentStores.length, mapping.spec]);

    const newActiveConnections = useMemo(
        () => activeConnections.filter((c) => !isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );

    const newConnectionsPassing = useMemo(() => {
        if (newActiveConnections.length === 0) return true;
        return newActiveConnections.every((c) => c.status === 'success');
    }, [newActiveConnections]);

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
                    nextLabel: 'Save Changes',
                    canAdvance: () =>
                        dataPlanes.length > 0 &&
                        !hasPendingStore &&
                        newConnectionsPassing,
                    onAdvance: save,
                },
            ] satisfies WizardStep[],
        [dataPlanes, newConnectionsPassing, hasPendingStore, title]
    );

    return (
        <FormProvider {...methods}>
            <WizardDialog
                open={open}
                onClose={handleClose}
                steps={steps}
                showActions={hasChanges}
            />
        </FormProvider>
    );
}

export function UpdateMappingWizard() {
    const { open, onClose, context } = useDialog('EDIT_STORAGE_MAPPING');
    const { storageMappings } = useStorageMappings();

    const prefix = context.prefix;

    const mapping = useMemo((): MappingData | null => {
        if (!prefix) return null;

        const match = storageMappings.find((sm) => sm.catalogPrefix === prefix);
        if (!match) return null;

        return {
            catalog_prefix: match.catalogPrefix,
            spec: {
                data_planes: match.spec.data_planes,
                stores: match.spec.stores.map((store): StoreEntry => {
                    const provider = storageProviderToCloudProvider(
                        store.provider
                    );
                    switch (provider) {
                        case 'GCP':
                            return {
                                provider,
                                bucket: store.bucket,
                                storage_prefix: store.prefix,
                            };
                        case 'AWS':
                            return {
                                provider,
                                bucket: store.bucket,
                                region: '',
                                storage_prefix: store.prefix,
                            };
                        case 'AZURE':
                            return {
                                provider,
                                container_name: store.bucket,
                                storage_account_name: '',
                                account_tenant_id: '',
                                storage_prefix: store.prefix,
                            };
                    }
                }),
            },
        };
    }, [prefix, storageMappings]);

    // Preserve mapping during exit animation so dialog content doesn't disappear
    const lastMapping = useRef(mapping);
    if (mapping) lastMapping.current = mapping;

    const displayMapping = mapping ?? lastMapping.current;

    if (!displayMapping) return null;

    return (
        <ConnectionTestProvider
            key={displayMapping.catalog_prefix}
            catalog_prefix={displayMapping.catalog_prefix}
        >
            {/* <pre>{JSON.stringify(mapping, null, 2)}</pre> */}
            <DialogInner
                key={displayMapping.catalog_prefix}
                mapping={displayMapping}
                open={open}
                onClose={onClose}
            />
        </ConnectionTestProvider>
    );
}
