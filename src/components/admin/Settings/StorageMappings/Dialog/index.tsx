import type { Dispatch, SetStateAction } from 'react';
import type {
    ConnectionTestResult,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useMemo, useRef, useState } from 'react';
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
    const [testResult, setTestResult] = useState<ConnectionTestResult>({
        status: 'idle',
    });
    const testPromiseRef = useRef<Promise<ConnectionTestResult> | null>(null);

    const methods = useForm<StorageMappingFormData>({
        mode: 'onBlur',
        defaultValues: {
            catalog_prefix: '',
            provider: '',
            region: '',
            bucket: '',
            storage_prefix: '',
            data_plane: '',
            select_additional: false,
            use_same_region: true,
        },
    });

    const runConnectionTest = async (): Promise<ConnectionTestResult> => {
        // TODO: Replace with actual connection test API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success (or failure based on some condition)
        const success = Math.random() > 0.3; // 70% success rate for demo
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

    const startConnectionTest = () => {
        // Use flushSync to ensure the 'testing' state is applied immediately
        // This prevents the save button from flashing enabled during transition
        flushSync(() => {
            setTestResult({ status: 'testing' });
        });

        const promise = runConnectionTest();
        testPromiseRef.current = promise;

        promise.then((result) => {
            // Only update if this is still the current test
            if (testPromiseRef.current === promise) {
                setTestResult(result);
            }
        });
    };

    const handleRetry = () => {
        startConnectionTest();
    };

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
                        result={testResult}
                        onRetry={handleRetry}
                    />
                ),
            },
        ],
        [testResult]
    );

    const closeDialog = () => {
        setOpen(false);
        methods.reset();
        setTestResult({ status: 'idle' });
        testPromiseRef.current = null;
    };

    const validateStep = async (stepIndex: number): Promise<boolean> => {
        if (stepIndex === 0) {
            // Validate form first
            const isValid = await methods.trigger();
            if (!isValid) {
                return false;
            }

            // Start connection test (don't wait for it)
            startConnectionTest();

            // Proceed to step 2 immediately to show progress
            return true;
        }
        if (stepIndex === 1) {
            // Only allow save when connection test passed
            return testResult.status === 'success';
        }
        return true;
    };

    const canProceed = (stepIndex: number): boolean => {
        // Disable button on step 1 until test passes
        // Also disable on step 0 if test is in progress (during transition)
        if (stepIndex === 1 || testResult.status === 'testing') {
            return testResult.status === 'success';
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
                validateStep={validateStep}
                canProceed={canProceed}
                onComplete={handleComplete}
                titleId="configure-storage-dialog-title"
            />
        </FormProvider>
    );
}

export default ConfigureStorageDialog;
