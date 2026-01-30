import type { Dispatch, SetStateAction } from 'react';
import type {
    ConnectionTestResult,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useRef, useState } from 'react';

import { flushSync } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useStorageMappingService } from 'src/api/storageMappingsGql';
import {
    ConnectionTestKey,
    ConnectionTestProvider,
    ConnectionTestResults,
} from 'src/components/admin/Settings/StorageMappings/Dialog/ConnectionTestContext';
import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import { TestConnectionResult } from 'src/components/admin/Settings/StorageMappings/Dialog/TestConnectionResult';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';

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
    const store = {
        bucket: data.bucket,
        prefix: data.storage_prefix,
        provider:
            data.use_same_region && primaryDataPlane
                ? primaryDataPlane.cloudProvider
                : data.provider,
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

export function ConfigureStorageWizard({ open, setOpen }: Props) {
    const intl = useIntl();
    const { testConnection, testSingleConnection, create } =
        useStorageMappingService();

    const [testResults, setTestResults] = useState<ConnectionTestResults>(
        new Map()
    );
    const testPromisesRef = useRef<
        Record<string, Promise<ConnectionTestResult>>
    >({});

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            data_planes: [],
            select_additional: false,
            use_same_region: true,
            allow_public: false,
        },
    });

    const startConnectionTests = useCallback(() => {
        const formData = methods.getValues();
        const input = buildMappingFromFormData(formData);
        const dataPlanes = formData.data_planes;
        const bucket = formData.bucket;

        // Initialize all data planes to 'testing' state
        const initialResults: ConnectionTestResults = new Map();
        dataPlanes.forEach((dp) => {
            initialResults.set([dp, { bucket, provider: dp.cloudProvider }], {
                status: 'testing',
            });
        });

        flushSync(() => {
            setTestResults(initialResults);
        });

        // Clear old promises and start new test
        testPromisesRef.current = {};

        // Run the connection test for all data planes
        const promise = testConnection(input, dataPlanes);

        // Track promise for each data plane (all use same promise)
        dataPlanes.forEach((dp) => {
            const key = buildTestKey({
                dataPlaneName: dp.dataPlaneName,
                bucket,
            });
            testPromisesRef.current[key] = promise.then(
                (results) => results[dp.dataPlaneName]
            );
        });

        promise.then((results) => {
            // Update all results at once - convert to keyed results
            const keyedResults: ConnectionTestResults = {};
            Object.entries(results).forEach(([dataPlaneName, result]) => {
                const key = buildTestKey({ dataPlaneName, bucket });
                keyedResults[key] = result;
            });
            setTestResults((prev) => ({
                ...prev,
                ...keyedResults,
            }));
        });
    }, [testConnection, methods]);

    const handleRetry = useCallback(
        (testKey: ConnectionTestKey) => {
            const formData = methods.getValues();
            const input = buildMappingFromFormData(formData);
            const dataPlane = formData.data_planes.find(
                (dp) => dp.dataPlaneName === testKey.dataPlaneName
            );

            if (!dataPlane) return;

            const key = buildTestKey(testKey);

            // Set this specific data plane to testing
            setTestResults((prev) => ({
                ...prev,
                [key]: { status: 'testing' },
            }));

            const promise = testSingleConnection(input, dataPlane);
            testPromisesRef.current[key] = promise;
            promise.then((result) => {
                if (testPromisesRef.current[key] === promise) {
                    setTestResults((prev) => ({
                        ...prev,
                        [key]: result,
                    }));
                }
            });
        },
        [testSingleConnection, methods]
    );

    // Check if all data planes have completed testing successfully
    const allTestsPassed = useMemo(() => {
        const formData = methods.getValues();
        const dataPlanes = formData.data_planes;
        const bucket = formData.bucket;
        if (dataPlanes.length === 0) return false;
        return dataPlanes.every((dp) => {
            const key = buildTestKey({
                dataPlaneName: dp.dataPlaneName,
                bucket,
            });
            return testResults[key]?.status === 'success';
        });
    }, [testResults, methods]);

    // Check if any tests are currently running
    const anyTestRunning = useMemo(() => {
        return Object.values(testResults).some(
            (result) => result.status === 'testing'
        );
    }, [testResults]);

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
                canProceed: () => methods.formState.isValid,
                onProceed: () => {
                    startConnectionTests();
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
            testResults,
            handleRetry,
            methods.formState.isValid,
            allTestsPassed,
            anyTestRunning,
            startConnectionTests,
        ]
    );

    const closeDialog = () => {
        setOpen(false);

        // reset state in case parent keeps this dialog mounted
        methods.reset();
        setTestResults({});
        testPromisesRef.current = {};
    };

    const handleComplete = async () => {
        const data = methods.getValues();
        await create(buildMappingFromFormData(data));
        closeDialog();
    };

    return (
        <FormProvider {...methods}>
            <ConnectionTestProvider results={testResults} onRetry={handleRetry}>
                <WizardDialog
                    open={open}
                    onClose={closeDialog}
                    steps={steps}
                    onComplete={handleComplete}
                />
            </ConnectionTestProvider>
        </FormProvider>
    );
}
