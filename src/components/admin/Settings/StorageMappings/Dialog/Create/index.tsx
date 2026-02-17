import type {
    CloudProvider,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useMemo } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useStorageMappingService } from 'src/api/storageMappingsGql';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Create/Form';
import { TestConnectionResult } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/TestConnectionResult';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';
import { useStorageMappingsRefresh } from 'src/components/tables/StorageMappings/shared';

interface Props {
    open: boolean;
    onClose: () => void;
}

function buildMappingPayload(
    mapping: StorageMappingFormData
): Omit<
    Parameters<ReturnType<typeof useStorageMappingService>['create']>[0],
    'dryRun'
> {
    const store = mapping.fragment_stores[0];

    return {
        catalogPrefix: mapping.catalog_prefix,
        storage: {
            stores: [
                {
                    bucket: store.bucket,
                    prefix: store.storage_prefix,
                    provider: store.provider,
                },
            ],
            data_planes: mapping.data_planes.map((dp) => dp.dataPlaneName),
        },
        detail: undefined,
    };
}

function _ConfigureStorageWizard({
    open,
    onClose,
    methods,
}: Props & { methods: ReturnType<typeof useForm<StorageMappingFormData>> }) {
    const intl = useIntl();
    const { create } = useStorageMappingService();
    const { testAll, results, testsPassing } = useConnectionTest();
    const { getValues, formState } = methods;
    const refresh = useStorageMappingsRefresh();

    const steps: WizardStep[] = useMemo(
        () => [
            {
                label: intl.formatMessage({
                    id: 'storageMappings.wizard.step.configure',
                }),
                title: intl.formatMessage({
                    id: 'storageMappings.wizard.title.configure',
                }),
                component: <StorageMappingForm />,
                nextLabel: intl.formatMessage({
                    id: 'storageMappings.wizard.cta.testConnection',
                }),
                canProceed: () =>
                    formState.isValid &&
                    getValues().catalog_prefix.length > 0 &&
                    getValues().data_planes.length > 0,
                onProceed: async () => {
                    const { data_planes, fragment_stores } = getValues();
                    await testAll(data_planes, fragment_stores);
                    return true;
                },
            },
            {
                label: intl.formatMessage({
                    id: 'storageMappings.wizard.step.test',
                }),
                title: intl.formatMessage({
                    id: 'storageMappings.wizard.title.test',
                }),
                component: <TestConnectionResult />,
                canProceed: () => testsPassing,
            },
        ],
        [intl, results, formState.isValid, getValues, testsPassing, testAll]
    );

    const closeDialog = () => {
        onClose();
        methods.reset();
        results.clear();
    };

    const handleComplete = async () => {
        await create(buildMappingPayload(methods.getValues()));
        refresh();
        closeDialog();
    };

    return (
        <WizardDialog
            open={open}
            onCancel={closeDialog}
            steps={steps}
            onComplete={handleComplete}
        />
    );
}

export function CreateMappingWizard(props: Props) {
    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            data_planes: [],
            default_data_plane: null,
            fragment_stores: [
                {
                    provider: '' as CloudProvider,
                    region: '',
                    bucket: '',
                    storage_prefix: '',
                    _isNew: true,
                },
            ],
            catalog_prefix: '',
            select_additional: false,
            allow_public: false,
        },
    });

    const catalogPrefix = methods.watch('catalog_prefix');

    return (
        <FormProvider {...methods}>
            <ConnectionTestProvider catalog_prefix={catalogPrefix}>
                <_ConfigureStorageWizard methods={methods} {...props} />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
