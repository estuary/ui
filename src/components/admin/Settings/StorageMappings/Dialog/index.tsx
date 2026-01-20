import type { Dispatch, SetStateAction } from 'react';

import { Dialog } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';

import StorageMappingActions from 'src/components/admin/Settings/StorageMappings/Dialog/Actions';
import StorageMappingContent from 'src/components/admin/Settings/StorageMappings/Dialog/Content';
import { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';
import StorageMappingTitle from 'src/components/admin/Settings/StorageMappings/Dialog/Title';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'configure-storage-dialog-title';

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
        },
    });

    const closeDialog = () => {
        setOpen(false);
        methods.reset();
    };

    const onSubmit = (data: StorageMappingFormData) => {
        console.log('save', data);
    };

    return (
        <FormProvider {...methods}>
            <Dialog open={open} maxWidth="sm" fullWidth aria-labelledby={TITLE_ID}>
                <StorageMappingTitle closeDialog={closeDialog} />

                <StorageMappingContent />
                <StorageMappingActions
                    onClose={closeDialog}
                    onSave={methods.handleSubmit(onSubmit)}
                />
            </Dialog>
        </FormProvider>
    );
}

export default ConfigureStorageDialog;
