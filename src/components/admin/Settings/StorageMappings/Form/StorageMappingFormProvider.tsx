import type { ReactNode } from 'react';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';

import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { ConnectionTestProvider } from 'src/components/admin/Settings/StorageMappings/ConnectionTest/ConnectionTestContext';

interface StorageMappingFormProviderProps {
    defaultValues?: StorageMappingFormData;
    children: ReactNode;
}

export function StorageMappingFormProvider({
    defaultValues,
    children,
}: StorageMappingFormProviderProps) {
    const methods = useForm<StorageMappingFormData>({
        mode: 'onChange',
        defaultValues,
    });

    return (
        <FormProvider {...methods}>
            <StorageMappingFormProviderInner>
                {children}
            </StorageMappingFormProviderInner>
        </FormProvider>
    );
}

function StorageMappingFormProviderInner({
    children,
}: StorageMappingFormProviderProps) {
    const { watch } = useFormContext<StorageMappingFormData>();

    const catalogPrefix = watch('catalogPrefix');
    const dataPlanes = watch('dataPlanes');
    const fragmentStores = watch('fragmentStores');

    console.log('catalogPrefix =', catalogPrefix);
    console.log('dataPlanes =', dataPlanes);
    console.log('fragmentStores =', fragmentStores);

    return (
        <ConnectionTestProvider
            catalogPrefix={catalogPrefix}
            dataPlanes={dataPlanes}
            fragmentStores={fragmentStores}
        >
            {children}
        </ConnectionTestProvider>
    );
}
