import type { Dispatch, SetStateAction } from 'react';
import type {
    ConnectionTestResult,
    ConnectionTestResults,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useCallback, useMemo, useRef, useState } from 'react';

import { flushSync } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

import StorageMappingContent from 'src/components/admin/Settings/StorageMappings/Dialog/Content';
import TestConnectionResult from 'src/components/admin/Settings/StorageMappings/Dialog/steps/TestConnectionResult';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function ConfigureStorageDialog({ open, setOpen }: Props) {
    const [testResults, setTestResults] = useState<ConnectionTestResults>({});
    const testPromisesRef = useRef<Map<string, Promise<ConnectionTestResult>>>(
        new Map()
    );

    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues: {
            catalog_prefix: '',
            provider: '',
            region: '',
            bucket: '',
            storage_prefix: '',
            data_planes: [],
            select_additional: false,
            use_same_region: true,
            allow_public: false,
        },
    });

    const runConnectionTest = async (
        _dataPlaneId: string
    ): Promise<ConnectionTestResult> => {
        // TODO: Replace with actual connection test API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success (or failure based on some condition)
        const success = Math.random() > 0.5; // 50% success rate for demo
        if (success) {
            return { status: 'success' };
        } else {
            return {
                status: 'error',
                errorMessage:
                    'Unable to access bucket. Please verify your bucket name and permissions.',
            };
        }
    };

    const startConnectionTests = useCallback(() => {
        const dataPlaneIds = methods.getValues('data_planes');

        // Initialize all data planes to 'testing' state
        const initialResults: ConnectionTestResults = {};
        dataPlaneIds.forEach((id) => {
            initialResults[id] = { status: 'testing' };
        });

        flushSync(() => {
            setTestResults(initialResults);
        });

        // Clear old promises and start new tests
        testPromisesRef.current.clear();

        dataPlaneIds.forEach((dataPlaneId) => {
            const promise = runConnectionTest(dataPlaneId);
            testPromisesRef.current.set(dataPlaneId, promise);

            promise.then((result) => {
                // Only update if this is still the current test for this data plane
                if (testPromisesRef.current.get(dataPlaneId) === promise) {
                    setTestResults((prev) => ({
                        ...prev,
                        [dataPlaneId]: result,
                    }));
                }
            });
        });
    }, [methods]);

    const handleRetry = useCallback((dataPlaneId: string) => {
        // Set this specific data plane to testing
        setTestResults((prev) => ({
            ...prev,
            [dataPlaneId]: { status: 'testing' },
        }));

        const promise = runConnectionTest(dataPlaneId);
        testPromisesRef.current.set(dataPlaneId, promise);

        promise.then((result) => {
            if (testPromisesRef.current.get(dataPlaneId) === promise) {
                setTestResults((prev) => ({
                    ...prev,
                    [dataPlaneId]: result,
                }));
            }
        });
    }, []);

    const steps: WizardStep[] = useMemo(
        () => [
            {
                id: 'configure',
                label: (
                    <FormattedMessage id="storageMappings.wizard.step.configure" />
                ),
                title: (
                    <FormattedMessage id="storageMappings.wizard.title.configure" />
                ),
                component: <StorageMappingContent />,
                nextLabel: (
                    <FormattedMessage id="storageMappings.wizard.cta.testConnection" />
                ),
            },
            {
                id: 'test',
                label: (
                    <FormattedMessage id="storageMappings.wizard.step.test" />
                ),
                title: (
                    <FormattedMessage id="storageMappings.wizard.title.test" />
                ),
                component: (
                    <TestConnectionResult
                        results={testResults}
                        onRetry={handleRetry}
                    />
                ),
            },
        ],
        [testResults, handleRetry]
    );

    const closeDialog = () => {
        setOpen(false);
        methods.reset();
        setTestResults({});
        testPromisesRef.current.clear();
    };

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

    const onProceed = async (stepIndex: number): Promise<boolean> => {
        if (stepIndex === 0) {
            // Start connection tests for all data planes
            startConnectionTests();
        }
        return true;
    };

    const canProceed = (stepIndex: number): boolean => {
        if (stepIndex === 0) {
            return methods.formState.isValid;
        }
        // Disable button on step 1 until all tests pass
        // Also disable on step 0 if any test is in progress (during transition)
        if (stepIndex === 1 || anyTestRunning) {
            return allTestsPassed;
        }
        return true;
    };

    const handleComplete = async () => {
        const data = methods.getValues();
        console.log('Wizard completed with data:', data);
        // TODO: Submit storage mapping to API
        closeDialog();
    };

    return (
        <FormProvider {...methods}>
            <WizardDialog
                open={open}
                onClose={closeDialog}
                steps={steps}
                onProceed={onProceed}
                canProceed={canProceed}
                onComplete={handleComplete}
                titleId="configure-storage-dialog-title"
            />
        </FormProvider>
    );
}

export default ConfigureStorageDialog;
