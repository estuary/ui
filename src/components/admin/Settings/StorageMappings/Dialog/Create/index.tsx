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
import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { useDataPlanes } from 'src/api/gql/dataPlanes';
import { useStorageMappingService } from 'src/api/gql/storageMappings';
import {
    ConnectionList,
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTest';
import { PrefixCard } from 'src/components/admin/Settings/StorageMappings/Dialog/Create/PrefixCard';
import { DataPlanesCard } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard';
import { StorageFields } from 'src/components/admin/Settings/StorageMappings/Dialog/StorageFields';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { cardHeaderSx } from 'src/context/Theme';
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
    const intl = useIntl();
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
            required: intl.formatMessage({
                id: 'storageMappings.dialog.dataPlanes.validation.required',
            }),
        },
    });

    const dataPlanes = watch('dataPlanes');
    const allowPublic = watch('allowPublic');
    const stores = watch('fragmentStores');

    const refresh = useStorageMappingsRefresh();

    const closeDialog = () => {
        onClose();
        reset();
        clearConnectionTests();
    };

    const handleComplete = useCallback(async () => {
        await create(buildMappingPayload(getValues()));
        refresh();
        return true;
    }, [create, getValues, refresh]);

    const steps = useMemo(
        (): WizardStep[] =>
            dataPlanesError
                ? [
                      {
                          title: intl.formatMessage({
                              id: 'storageMappings.wizard.title.configure',
                          }),
                          component: (
                              <AlertBox short severity="error">
                                  {intl.formatMessage({
                                      id: 'storageMappings.dialog.error.loadFailed',
                                  })}
                              </AlertBox>
                          ),
                          nextLabel: intl.formatMessage({
                              id: 'cta.close',
                          }),
                          onAdvance: async () => {
                              closeDialog();
                              return false;
                          },
                      },
                  ]
                : [
                      {
                          title: intl.formatMessage({
                              id: 'storageMappings.wizard.title.configure',
                          }),
                          component: (
                              <>
                                  <MessageWithLink
                                      messageID="storageMappings.dialog.create.description"
                                  />
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
                                                  setValue(
                                                      'allowPublic',
                                                      value
                                                  )
                                              }
                                          />
                                      </CardWrapper>
                                      <CardWrapper>
                                          <Typography sx={cardHeaderSx}>
                                              {intl.formatMessage({
                                                  id: 'storageMappings.dialog.storageLocations.title',
                                              })}
                                          </Typography>
                                          <StorageFields
                                              defaultDataPlane={dataPlanes[0]}
                                          />
                                      </CardWrapper>
                                  </Stack>
                              </>
                          ),
                          nextLabel: intl.formatMessage({
                              id: 'storageMappings.wizard.cta.testConnection',
                          }),
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
                          title: intl.formatMessage({
                              id: 'storageMappings.wizard.title.test',
                          }),
                          component: (
                              <Stack spacing={3}>
                                  <Typography>
                                      {intl.formatMessage({
                                          id: 'storageMappings.dialog.create.testDescription.prefix',
                                      })}
                                      <Link
                                          href={intl.formatMessage({
                                              id: 'storageMappings.dialog.docsPath',
                                          })}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                      >
                                          {intl.formatMessage({
                                              id: 'storageMappings.dialog.docsLink',
                                          })}
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
            intl,
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
