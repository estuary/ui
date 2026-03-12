import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { FragmentStore } from 'src/api/gql/storageMappings';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import {
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';
import {
    useStorageMappings,
    useStorageMappingService,
} from 'src/api/gql/storageMappings';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest';
import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { ConnectionTestsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/ConnectionTestsCard';
import { StorageLocationsCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update/StorageLocationsCard';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import ExternalLink from 'src/components/shared/ExternalLink';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { useDialog } from 'src/hooks/useDialog';
import { logRocketConsole } from 'src/services/shared';

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
    const intl = useIntl();
    const { update } = useStorageMappingService();

    const {
        clear: clearConnectionTests,
        allTestsPassing,
        testConnections,
        initializeEndpoints,
        addDataPlane: connectToDp,
        removeDataPlane: disconnectDp,
    } = useConnectionTest();

    const initialized = useRef(false);
    useEffect(() => {
        if (initialized.current) return;
        if (mapping.dataPlanes.length === 0 || mapping.stores.length === 0)
            return;
        initialized.current = true;
        const connections = initializeEndpoints(
            mapping.dataPlanes,
            mapping.stores
        );
        void testConnections(connections).catch(() => {});
    }, [mapping, initializeEndpoints, testConnections]);

    const refresh = useStorageMappingsRefresh();

    const { getValues, watch, setValue, reset } =
        useFormContext<StorageMappingFormData>();
    const {
        append: appendDataPlane,
        remove: removeDataPlaneField,
        move: moveDataPlane,
    } = useFieldArray({
        name: 'dataPlanes',
        rules: {
            required: intl.formatMessage({
                id: 'storageMappings.dialog.dataPlanes.validation.required',
            }),
        },
    });
    const allowPublic = watch('allowPublic');
    const dataPlanes = watch('dataPlanes');
    const fragmentStores = watch('fragmentStores');

    const selectDataPlane = useCallback(
        (dp: DataPlaneNode) => {
            appendDataPlane(dp);
            const connections = connectToDp(dp);

            // only test connections that don't have previous results
            testConnections(
                connections.filter((c) => c.status === 'idle')
            ).catch(() => {});
        },
        [appendDataPlane, connectToDp, testConnections]
    );

    const deselectDataPlane = useCallback(
        (index: number) => {
            const dp = dataPlanes[index];
            removeDataPlaneField(index);
            if (dp) {
                disconnectDp(dp);
            }
        },
        [dataPlanes, removeDataPlaneField, disconnectDp]
    );

    const [nestedStoreFormOpen, setNestedStoreFormOpen] = useState(false);

    const handleClose = useCallback(() => {
        reset({
            catalogPrefix: mapping.catalogPrefix,
            dataPlanes: mapping.dataPlanes,
            fragmentStores: mapping.stores,
            allowPublic: false,
        });
        setNestedStoreFormOpen(false);
        initialized.current = false;
        clearConnectionTests();
        onClose();
    }, [onClose, clearConnectionTests, reset, mapping]);

    const hasChanges = useMemo(() => {
        const dpChanged =
            // default dp has changed
            dataPlanes[0]?.name !== mapping.dataPlanes[0]?.name ||
            // or any dp has been added
            dataPlanes.some(
                (dp) => !mapping.dataPlanes.some((d) => d.name === dp.name)
            ) ||
            // or any dp has been removed
            mapping.dataPlanes.some(
                (dp) => !dataPlanes.some((d) => d.name === dp.name)
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

    const save = useCallback(async () => {
        const data = getValues();
        await update({
            catalogPrefix: data.catalogPrefix,
            spec: {
                fragmentStores: data.fragmentStores,
                dataPlanes: data.dataPlanes.map((dp) => dp.name),
            },
        });
        refresh();
        return true;
    }, [getValues, update, refresh]);

    const title = useMemo(
        () => (
            <Typography variant="h6" component="span" fontWeight={600}>
                {intl.formatMessage({
                    id: 'storageMappings.dialog.update.title',
                })}
                <TechnicalEmphasis>{mapping.catalogPrefix}</TechnicalEmphasis>
            </Typography>
        ),
        [intl, mapping.catalogPrefix]
    );

    const steps = useMemo(
        () =>
            [
                {
                    title,
                    component: (
                        <>
                            <Typography sx={{ mb: 4 }}>
                                {intl.formatMessage({
                                    id: 'storageMappings.dialog.update.description.prefix',
                                })}
                                <ExternalLink
                                    link={intl.formatMessage({
                                        id: 'storageMappings.dialog.docsPath',
                                    })}
                                >
                                    {intl.formatMessage({
                                        id: 'storageMappings.dialog.docsLink',
                                    })}
                                </ExternalLink>
                                {intl.formatMessage({
                                    id: 'storageMappings.dialog.update.description.suffix',
                                })}
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
                                        onRemove={deselectDataPlane}
                                        onSelectDefault={(index) =>
                                            moveDataPlane(index, 0)
                                        }
                                        onToggleAllowPublic={(value) =>
                                            setValue('allowPublic', value)
                                        }
                                    />
                                </CardWrapper>
                                <CardWrapper>
                                    <StorageLocationsCard
                                        formOpen={nestedStoreFormOpen}
                                        setFormOpen={setNestedStoreFormOpen}
                                    />
                                </CardWrapper>
                                <CardWrapper>
                                    <ConnectionTestsCard />
                                </CardWrapper>
                            </Stack>
                        </>
                    ),
                    nextLabel: intl.formatMessage({
                        id: 'storageMappings.dialog.update.saveChanges',
                    }),
                    canAdvance: () =>
                        dataPlanes.length > 0 &&
                        !nestedStoreFormOpen &&
                        allTestsPassing,
                    onAdvance: save,
                },
            ] satisfies WizardStep[],
        [
            intl,
            dataPlanes,
            allTestsPassing,
            nestedStoreFormOpen,
            title,
            allowPublic,
            deselectDataPlane,
            moveDataPlane,
            save,
            selectDataPlane,
            setValue,
        ]
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
    const intl = useIntl();
    const { open, onClose, context } = useDialog('EDIT_STORAGE_MAPPING');
    const { storageMappings, error: storageMappingsError } =
        useStorageMappings();
    const {
        dataPlanes,
        loading: dataPlanesLoading,
        error: dataPlanesError,
    } = useDataPlanes();

    const queryError = storageMappingsError ?? dataPlanesError;

    const prefix = context.prefix;

    const storageMapping = useMemo((): MappingData | null => {
        if (!prefix || dataPlanesLoading) return null;

        const mapping = storageMappings.find(
            (sm) => sm.catalogPrefix === prefix
        );
        if (!mapping) return null;

        return {
            catalogPrefix: mapping.catalogPrefix,
            dataPlanes: mapping.spec.dataPlanes
                .map((name: string) =>
                    dataPlanes.find((dp) => dp.name === name)
                )
                .filter((dp): dp is DataPlaneNode => dp !== undefined),
            stores: mapping.spec.fragmentStores,
        };
    }, [prefix, storageMappings, dataPlanes, dataPlanesLoading]);

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalogPrefix: storageMapping?.catalogPrefix,
            dataPlanes: storageMapping?.dataPlanes ?? [],
            fragmentStores: storageMapping?.stores ?? [],
            allowPublic: true,
        },
    });

    // Reset form values when the target mapping changes (identified by prefix).
    // defaultValues only apply on mount, so if storageMapping is null initially
    // (data still loading), the form needs to be reset once data arrives.
    const initializedForPrefix = useRef<string | null>(null);
    const handleClose = useCallback(() => {
        // Clear the initialized ref so that if the same mapping is edited again, the form will reset to the correct values.
        initializedForPrefix.current = null;
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (
            storageMapping &&
            initializedForPrefix.current !== storageMapping.catalogPrefix
        ) {
            initializedForPrefix.current = storageMapping.catalogPrefix;
            methods.reset({
                catalogPrefix: storageMapping.catalogPrefix,
                dataPlanes: storageMapping.dataPlanes,
                fragmentStores: storageMapping.stores ?? [],
                allowPublic: true,
            });
        }
    }, [storageMapping, methods]);

    // If the dialog is open but we can't resolve a mapping (missing prefix
    // or no match) and we're not still loading, close the dialog to clear
    // stale query params. This shouldn't ever happen.
    const notFound = open && !dataPlanesLoading && (!prefix || !storageMapping);
    useEffect(() => {
        if (notFound) {
            logRocketConsole('StorageMapping:edit:notFound', { prefix });
            onClose();
        }
    }, [notFound, onClose, prefix]);

    if (queryError && open) {
        const errorSteps: WizardStep[] = [
            {
                title: intl.formatMessage({
                    id: 'storageMappings.dialog.update.title',
                }),
                component: (
                    <AlertBox short severity="error">
                        {intl.formatMessage({
                            id: 'storageMappings.dialog.error.loadFailed',
                        })}
                    </AlertBox>
                ),
                nextLabel: intl.formatMessage({ id: 'cta.close' }),
                onAdvance: async () => {
                    onClose();
                    return false;
                },
            },
        ];

        return (
            <WizardDialog open={open} onClose={onClose} steps={errorSteps} />
        );
    }

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
                    onClose={handleClose}
                />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
