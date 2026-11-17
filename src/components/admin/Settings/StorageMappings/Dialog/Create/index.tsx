import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useEffect, useMemo } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import {
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form';

import { useStorageMappingService } from 'src/api/gql/storageMappings';
import {
    ConnectionList,
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest';
import { PrefixCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Create/PrefixCard';
import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { StorageFields } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageFields';
import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { cardHeaderSx } from 'src/context/Theme';
import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';
import { useDialog } from 'src/hooks/useDialog';

function buildMappingPayload(
    mapping: StorageMappingFormData
): Omit<
    Parameters<ReturnType<typeof useStorageMappingService>['create']>[0],
    'dryRun'
> {
    return {
        catalogPrefix: mapping.catalogPrefix,
        spec: {
            fragmentStores: mapping.fragmentStores,
            dataPlanes: mapping.dataPlanes.map((dp) => dp.name),
        },
        detail: undefined,
    };
}

function CreateMappingWizardInner({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { error: dataPlanesError } = useDataPlanes();
    const { create } = useStorageMappingService();
    const {
        testConnections,
        allTestsPassing,
        clear: clearConnectionTests,
        initializeEndpoints,
    } = useConnectionTest();
    const { getValues, formState, watch, setValue, reset } =
        useFormContext<StorageMappingFormData>();
    const { append, remove, move } = useFieldArray({
        name: 'dataPlanes',
        rules: {
            required: 'At least one data plane is required',
        },
    });

    const dataPlanes = watch('dataPlanes');
    const allowPublic = watch('allowPublic');
    const stores = watch('fragmentStores');

    const closeDialog = useCallback(() => {
        onClose();
        reset();
        clearConnectionTests();
    }, [onClose, reset, clearConnectionTests]);

    const handleComplete = useCallback(async () => {
        await create(buildMappingPayload(getValues()));
        return true;
    }, [create, getValues]);

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
                          component: (
                              <>
                                  <MessageWithLink messageID="storageMappings.dialog.create.description" />
                                  <Stack spacing={2}>
                                      <CardWrapper>
                                          <PrefixCard />
                                      </CardWrapper>
                                      <CardWrapper>
                                          <DataPlanesCard
                                              dataPlanes={dataPlanes}
                                              defaultDataPlane={
                                                  dataPlanes.length > 0
                                                      ? dataPlanes[0]
                                                      : null
                                              }
                                              allowPublicChecked={allowPublic}
                                              onSelect={append}
                                              onRemove={remove}
                                              onSelectDefault={(index) =>
                                                  move(index, 0)
                                              }
                                              onToggleAllowPublic={(value) =>
                                                  setValue('allowPublic', value)
                                              }
                                          />
                                      </CardWrapper>
                                      <CardWrapper>
                                          <Typography sx={cardHeaderSx}>
                                              Storage Locations
                                          </Typography>
                                          <StorageFields
                                              defaultDataPlane={dataPlanes[0]}
                                          />
                                      </CardWrapper>
                                  </Stack>
                              </>
                          ),
                          nextLabel: 'Continue to connection test',
                          canAdvance: () => formState.isValid,
                          onAdvance: async () => {
                              const connections = initializeEndpoints(
                                  dataPlanes,
                                  stores
                              );

                              await testConnections(connections);
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
            formState.isValid,
            allTestsPassing,
            testConnections,
            dataPlanes,
            allowPublic,
            stores,
            append,
            handleComplete,
            initializeEndpoints,
            move,
            remove,
            setValue,
            closeDialog,
        ]
    );

    return <WizardDialog open={open} onClose={closeDialog} steps={steps} />;
}

export function CreateMappingWizard() {
    const { open, onClose } = useDialog('CREATE_STORAGE_MAPPING');

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalogPrefix: '',
            dataPlanes: [],
            fragmentStores: [{}],
            allowPublic: false,
        },
    });

    useEffect(() => {
        if (!open) {
            methods.reset();
        }
    }, [open, methods]);

    const catalogPrefix = methods.watch('catalogPrefix');

    return (
        <FormProvider {...methods}>
            <ConnectionTestProvider catalogPrefix={catalogPrefix}>
                <CreateMappingWizardInner open={open} onClose={onClose} />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
