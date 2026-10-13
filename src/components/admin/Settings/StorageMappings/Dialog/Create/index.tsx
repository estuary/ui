import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import { useFormContext } from 'react-hook-form';

import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/ConnectionTest';
import { useConnectionTestContext } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionTestContext';
import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingForm';
import { StorageMappingFormProvider } from 'src/components/admin/Settings/StorageMappings/Form/StorageMappingFormProvider';
import AlertBox from 'src/components/shared/AlertBox';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';
import { useCreateStorageMapping } from 'src/hooks/storageMappings/useCreateStorageMapping';
import { useDialog } from 'src/hooks/useDialog';

export function CreateMappingWizard() {
    const { open, onClose } = useDialog('CREATE_STORAGE_MAPPING');

    const defaultValues = useMemo<StorageMappingFormData>(
        () => ({
            catalogPrefix: '',
            dataPlanes: [],
            fragmentStores: [],
            allowPublic: false,
        }),
        []
    );

    return (
        <StorageMappingFormProvider defaultValues={defaultValues}>
            <CreateMappingWizardInner open={open} onClose={onClose} />
        </StorageMappingFormProvider>
    );
}

function CreateMappingWizardInner({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { error: dataPlanesError } = useDataPlanes();
    const createStorageMapping = useCreateStorageMapping();

    const { getValues, formState } = useFormContext<StorageMappingFormData>();
    const formValid = formState.isValid;

    const { connections, testAllConnections } = useConnectionTestContext();
    const allTestsPassing = connections.every((c) => c.status === 'success');

    const handleComplete = useCallback(async () => {
        const { catalogPrefix, dataPlanes, fragmentStores } = getValues();
        const dataPlaneNames = dataPlanes.map((dp) => dp.name);
        await createStorageMapping({
            catalogPrefix,
            dataPlaneNames,
            fragmentStores,
        });

        return true;
    }, [getValues, createStorageMapping]);

    const closeDialog = useCallback(() => {
        onClose();
        // reset();
    }, [onClose]);

    const steps = useMemo(
        (): WizardStep[] =>
            dataPlanesError
                ? [
                      {
                          title: 'New Collection Storage',
                          component: (
                              <AlertBox short severity="error">
                                  We weren&apos;t able to load the data needed
                                  for this form. Please reload the page and try
                                  again.
                              </AlertBox>
                          ),
                          nextLabel: 'Close',
                          onAdvance: async () => {
                              closeDialog();
                              return false;
                          },
                      },
                  ]
                : [
                      {
                          title: 'New Collection Storage',
                          component: <StorageMappingForm mode="create" />,
                          nextLabel: 'Continue to connection test',
                          canAdvance: () => formValid,
                          onAdvance: async () => {
                              await testAllConnections();
                              return true;
                          },
                      },
                      {
                          title: 'Authorize Storage Access',
                          component: (
                              <Stack spacing={3}>
                                  <Typography>
                                      Each data plane that processes your data
                                      needs its own access to your storage
                                      bucket. For more details, see the{' '}
                                      <Link
                                          href="https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                      >
                                          documentation
                                      </Link>
                                  </Typography>

                                  <ConnectionList />
                              </Stack>
                          ),
                          canAdvance: () => allTestsPassing,
                          onAdvance: handleComplete,
                      },
                  ],
        [
            dataPlanesError,
            handleComplete,
            closeDialog,
            formValid,
            testAllConnections,
            allTestsPassing,
        ]
    );

    return <WizardDialog open={open} onClose={closeDialog} steps={steps} />;
}
