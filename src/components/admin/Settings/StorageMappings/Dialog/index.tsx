import type { Dispatch, SetStateAction } from 'react';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import type { WizardStep } from 'src/components/shared/WizardDialog/types';

import { useMemo } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

import StorageMappingContent from 'src/components/admin/Settings/StorageMappings/Dialog/Content';
import TestConnectionStep from 'src/components/admin/Settings/StorageMappings/Dialog/steps/TestConnectionStep';
import { WizardDialog } from 'src/components/shared/WizardDialog/WizardDialog';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function ConfigureStorageDialog({ open, setOpen }: Props) {
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

    const steps: WizardStep[] = useMemo(
        () => [
            {
                id: 'configure',
                label: (
                    <FormattedMessage id="storageMappings.wizard.step.configure" />
                ),
                component: <StorageMappingContent />,
            },
            {
                id: 'test',
                label: (
                    <FormattedMessage id="storageMappings.wizard.step.test" />
                ),
                component: <TestConnectionStep />,
            },
        ],
        []
    );

    const closeDialog = () => {
        setOpen(false);
        methods.reset();
    };

    const validateStep = async (stepIndex: number): Promise<boolean> => {
        console.log('Validating step', stepIndex);
        if (stepIndex === 0) {
            // Validate form on first step before proceeding
            return methods.trigger();
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
                onComplete={handleComplete}
                title={
                    <FormattedMessage id="storageMappings.configureStorage.label" />
                }
                titleId="configure-storage-dialog-title"
            />
        </FormProvider>
    );
}

export default ConfigureStorageDialog;
