import type { Dispatch, SetStateAction } from 'react';
import type {
    ConnectionTestResult,
    ConnectionTestResults,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useRef, useState } from 'react';

import { StorageMappingForm } from './Form';
import { flushSync } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useStorageMappingService } from 'src/api/storageMappingsGql';
import TestConnectionResult from 'src/components/admin/Settings/StorageMappings/Dialog/TestConnectionResult';
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
    return {
        catalogPrefix: data.catalog_prefix,
        storage: {
            stores: [
                {
                    provider: data.provider,
                    bucket: data.bucket,
                    prefix: data.storage_prefix,
                },
            ],
            data_planes: data.data_planes,
        },
        detail: undefined,
    };
}

export function ConfigureStorageWizard({ open, setOpen }: Props) {
    const intl = useIntl();
    const { testConnection, testSingleConnection, create } =
        useStorageMappingService();

    const [testResults, setTestResults] = useState<ConnectionTestResults>({});
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
        const dataPlaneIds = formData.data_planes;

        // Initialize all data planes to 'testing' state
        const initialResults: ConnectionTestResults = {};
        dataPlaneIds.forEach((id) => {
            initialResults[id] = { status: 'testing' };
        });

        flushSync(() => {
            setTestResults(initialResults);
        });

        // Clear old promises and start new test
        testPromisesRef.current = {};

        // Run the connection test for all data planes
        const promise = testConnection(input, dataPlaneIds);

        // Track promise for each data plane (all use same promise)
        dataPlaneIds.forEach((id) => {
            testPromisesRef.current[id] = promise.then(
                (results) => results[id]
            );
        });

        promise.then((results) => {
            // Update all results at once
            setTestResults((prev) => ({
                ...prev,
                ...results,
            }));
        });
    }, [testConnection, methods]);

    const handleRetry = useCallback(
        (dataPlaneId: string) => {
            const formData = methods.getValues();
            const input = buildMappingFromFormData(formData);

            // Set this specific data plane to testing
            setTestResults((prev) => ({
                ...prev,
                [dataPlaneId]: { status: 'testing' },
            }));

            const promise = testSingleConnection(input, dataPlaneId);
            testPromisesRef.current[dataPlaneId] = promise;

            promise.then((result) => {
                if (testPromisesRef.current[dataPlaneId] === promise) {
                    setTestResults((prev) => ({
                        ...prev,
                        [dataPlaneId]: result,
                    }));
                }
            });
        },
        [testSingleConnection, methods]
    );

    // Check if all data planes have completed testing successfully
    const allTestsPassed = useMemo(() => {
        const dataPlaneIds = methods.getValues('data_planes');
        if (dataPlaneIds.length === 0) return false;
        return dataPlaneIds.every(
            (id) => testResults[id]?.status === 'success'
        );
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
                component: (
                    <TestConnectionResult
                        results={testResults}
                        onRetry={handleRetry}
                    />
                ),
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
            <WizardDialog
                open={open}
                onClose={closeDialog}
                steps={steps}
                onComplete={handleComplete}
            />
        </FormProvider>
    );
}
