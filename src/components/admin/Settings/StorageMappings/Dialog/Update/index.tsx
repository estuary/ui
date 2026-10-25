import type { StorageMapping } from 'src/api/gql/storageMappings';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo } from 'react';

import { Typography } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingForm';
import { StorageMappingFormProvider } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingFormProvider';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import AlertBox from 'src/components/shared/AlertBox';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMapping } from 'src/hooks/storageMappings/useStorageMapping';
import { useUpdateStorageMapping } from 'src/hooks/storageMappings/useUpdateStorageMapping';
import { useDialog } from 'src/hooks/useDialog';
import { logRocketConsole } from 'src/services/shared';
import { useTenantStore } from 'src/stores/Tenant';

function DialogInner({
    mapping,
    open,
    onClose,
}: {
    mapping: StorageMapping;
    open: boolean;
    onClose: () => void;
}) {
    const updateStorageMapping = useUpdateStorageMapping();

    const { getValues, formState } = useFormContext<StorageMappingFormData>();
    const formValid = formState.isValid;
    const formDirty = formState.isDirty;

    const handleSave = useCallback(async () => {
        const { catalogPrefix, dataPlanes, fragmentStores } = getValues();
        const dataPlaneNames = dataPlanes.map((dp) => dp.name);
        await updateStorageMapping({
            catalogPrefix,
            dataPlaneNames,
            fragmentStores,
        });
        return true;
    }, [getValues, updateStorageMapping]);

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
                    component: <StorageMappingForm mode="update" />,
                    nextLabel: 'Save Changes',
                    canAdvance: () => {
                        // dataPlanes.length > 0 &&
                        // !nestedStoreFormOpen &&
                        // allTestsPassing,
                        return formValid && formDirty;
                    },
                    onAdvance: handleSave,
                },
            ] satisfies WizardStep[],
        [title, handleSave, formValid, formDirty]
    );

    return (
        <WizardDialog
            open={open}
            steps={steps}
            showActions={formDirty}
            onClose={onClose}
        />
    );
}

export function UpdateMappingWizard() {
    const { open, onClose, context } = useDialog('EDIT_STORAGE_MAPPING');
    const prefix = context.prefix ?? undefined;

    const tenant = useTenantStore((state) => state.selectedTenant);
    const { storageMapping, loading, error } = useStorageMapping(
        tenant,
        prefix
    );

    const defaultValues: StorageMappingFormData = useMemo(
        () => ({
            catalogPrefix: storageMapping?.catalogPrefix ?? '',
            dataPlanes: storageMapping?.dataPlanes ?? [],
            fragmentStores: storageMapping?.fragmentStores ?? [],
            allowPublic: true,
        }),
        [
            storageMapping?.catalogPrefix,
            storageMapping?.dataPlanes,
            storageMapping?.fragmentStores,
        ]
    );

    // // Reset form values when the target mapping changes (identified by prefix).
    // // defaultValues only apply on mount, so if storageMapping is null initially
    // // (data still loading), the form needs to be reset once data arrives.
    // const initializedForPrefix = useRef<string | null>(null);
    // const handleClose = useCallback(() => {
    //     // Clear the initialized ref so that if the same mapping is edited again, the form will reset to the correct values.
    //     initializedForPrefix.current = null;
    //     onClose();
    // }, [onClose]);

    // useEffect(() => {
    //     if (
    //         storageMapping &&
    //         initializedForPrefix.current !== storageMapping.catalogPrefix
    //     ) {
    //         initializedForPrefix.current = storageMapping.catalogPrefix;
    //         methods.reset({
    //             catalogPrefix: storageMapping.catalogPrefix,
    //             dataPlanes: storageMapping.dataPlanes,
    //             fragmentStores: storageMapping.fragmentStores ?? [],
    //             allowPublic: true,
    //         });
    //     }
    // }, [storageMapping, methods]);

    // If the dialog is open but we can't resolve a mapping (missing prefix
    // or no match), close the dialog to clear stale query params. Wait for
    // both queries to settle first: on a deep link the mappings can still be
    // loading after the data planes resolve, and a query error leaves the
    // list empty — closing then would hide the error dialog below.
    const notFound = open && !loading && !error && (!prefix || !storageMapping);
    useEffect(() => {
        if (notFound) {
            logRocketConsole('StorageMapping:edit:notFound', { prefix });
            onClose();
        }
    }, [notFound, onClose, prefix]);

    if (error && open) {
        const errorSteps: WizardStep[] = [
            {
                title: 'Storage',
                component: (
                    <AlertBox short severity="error">
                        We weren&apos;t able to load the data needed for this
                        form. Please reload the page and try again.
                    </AlertBox>
                ),
                nextLabel: 'Close',
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
        <StorageMappingFormProvider defaultValues={defaultValues}>
            <DialogInner
                key={storageMapping.catalogPrefix}
                mapping={storageMapping}
                open={open}
                onClose={onClose}
            />
        </StorageMappingFormProvider>
    );
}
