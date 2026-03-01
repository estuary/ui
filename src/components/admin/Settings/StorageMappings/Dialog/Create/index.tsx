import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useEffect, useMemo } from 'react';

import { Link, Stack, Typography } from '@mui/material';

import DataPlanesCard from '../shared/DataPlanesCard';
import { StorageFields } from '../shared/StorageFields';
import { PrefixCard } from './PrefixCard';
import {
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useStorageMappingService } from 'src/api/storageMappingsGql';
import { toApiStore } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import { ConnectionList } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionList';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import CardWrapper from 'src/components/shared/CardWrapper';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';
import { cardHeaderSx } from 'src/context/Theme';
import { useDialog } from 'src/hooks/useDialog';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';
function buildMappingPayload(
    mapping: StorageMappingFormData
): Omit<
    Parameters<ReturnType<typeof useStorageMappingService>['create']>[0],
    'dryRun'
> {
    return {
        catalogPrefix: mapping.catalog_prefix,
        spec: {
            stores: mapping.fragment_stores.map(toApiStore),
            data_planes: mapping.data_planes.map((dp) => dp.dataPlaneName),
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
        name: 'data_planes',
        rules: {
            required: 'At least one data plane is required',
        },
    });

    const dataPlanes = watch('data_planes');
    const allowPublic = watch('allow_public');
    const stores = watch('fragment_stores');

    const refresh = useStorageMappingsRefresh();

    const closeDialog = () => {
        onClose();
        reset();
        clearConnectionTests();
    };

    const handleComplete = async () => {
        await create(buildMappingPayload(getValues()));
        refresh();
        return true;
    };

    const steps = useMemo(
        () =>
            [
                {
                    title: intl.formatMessage({
                        id: 'storageMappings.wizard.title.configure',
                    }),
                    component: (
                        <>
                            <Typography sx={{ mb: 4 }}>
                                Add a new storage location for your collection
                                data. For information and access requirements,
                                see the{' '}
                                <Link
                                    href={docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    documentation
                                </Link>
                                .
                            </Typography>
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
                                            setValue('allow_public', value)
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
                                Each data plane that processes your data needs
                                its own access to your storage bucket. For more
                                details, see the{' '}
                                <Link
                                    href={docsUrl}
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
            ] satisfies WizardStep[],
        [
            intl,
            formState.isValid,
            getValues,
            allTestsPassing,
            testConnections,
            dataPlanes,
            allowPublic,
            stores,
        ]
    );

    return <WizardDialog open={open} onClose={closeDialog} steps={steps} />;
}

export function CreateMappingWizard() {
    const { open, onClose } = useDialog('CREATE_STORAGE_MAPPING');

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            data_planes: [],
            fragment_stores: [
                {
                    _isNew: true,
                },
            ],
            allow_public: false,
        },
    });

    useEffect(() => {
        if (!open) {
            methods.reset();
        }
    }, [open, methods]);

    const catalogPrefix = methods.watch('catalog_prefix');

    return (
        <FormProvider {...methods}>
            <ConnectionTestProvider catalogPrefix={catalogPrefix}>
                <CreateMappingWizardInner open={open} onClose={onClose} />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
