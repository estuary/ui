import type { Dispatch, SetStateAction } from 'react';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useRef } from 'react';

import { flushSync } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import {
    CloudProvider,
    useStorageMappingService,
} from 'src/api/storageMappingsGql';
import {
    ConnectionTestProvider,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import { TestConnectionResult } from 'src/components/admin/Settings/StorageMappings/Dialog/TestConnectionResult';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';

interface InternalProps extends Props {
    methods: ReturnType<typeof useForm<StorageMappingFormData>>;
}
interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function buildMappingFromFormData(
    data: StorageMappingFormData
): Omit<
    Parameters<ReturnType<typeof useStorageMappingService>['create']>[0],
    'dryRun'
> {
    const primaryDataPlane = data.data_planes[0];
    const provider = (
        data.use_same_region && primaryDataPlane
            ? primaryDataPlane.cloudProvider
            : data.provider
    ) as CloudProvider;
    const store = {
        bucket: data.bucket,
        prefix: data.storage_prefix,
        provider,
        region:
            data.use_same_region && primaryDataPlane
                ? primaryDataPlane.region
                : data.region,
    };
    return {
        catalogPrefix: data.catalog_prefix,
        storage: {
            stores: [store],
            data_planes: data.data_planes.map((dp) => dp.dataPlaneName),
        },
        detail: undefined,
    };
}

function _ConfigureStorageWizard({ open, setOpen, methods }: InternalProps) {
    const intl = useIntl();
    const { create } = useStorageMappingService();
    const { testAll, results } = useConnectionTest();
    const { getValues, formState } = methods;

    // Check if all data planes have completed testing successfully
    const allTestsPassed = useMemo(() => {
        const formData = getValues();
        const dataPlanes = formData.data_planes;
        const bucket = formData.bucket;
        if (dataPlanes.length === 0) return false;
        // return dataPlanes.every((dp) => {
        //     const key = buildTestKey({
        //         dataPlaneName: dp.dataPlaneName,
        //         bucket,
        //     });
        //     return testResults.get(key)?.status === 'success';
        // });
        return false; // TODO: uncomment above when buildTestKey is implemented
    }, [getValues]);

    // Check if any tests are currently running
    const anyTestRunning = useMemo(() => {
        return Object.values(results).some(
            (result) => result.status === 'testing'
        );
    }, [results]);

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
                canProceed: () => formState.isValid,
                onProceed: async () => {
                    const data_planes = getValues().data_planes;
                    const bucket = getValues().bucket;
                    const use_same_region = getValues().use_same_region;
                    const provider = (
                        use_same_region
                            ? data_planes[0]?.cloudProvider
                            : getValues().provider
                    ) as CloudProvider;

                    await testAll(data_planes, [
                        {
                            bucket,
                            provider,
                        },
                    ]);
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
                canProceed: () => allTestsPassed && !anyTestRunning,
            },
        ],
        [
            intl,
            results,
            formState.isValid,
            getValues,
            allTestsPassed,
            anyTestRunning,
            testAll,
        ]
    );

    const closeDialog = () => {
        setOpen(false);

        // reset state in case parent keeps this dialog mounted
        methods.reset();
        results.clear();
    };

    const handleComplete = async () => {
        const data = methods.getValues();
        await create(buildMappingFromFormData(data));
        closeDialog();
    };

    return (
        <WizardDialog
            open={open}
            onClose={closeDialog}
            steps={steps}
            onComplete={handleComplete}
        />
    );
}

export function ConfigureStorageWizard(props: Props) {
    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            data_planes: [],
            select_additional: false,
            use_same_region: true,
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
