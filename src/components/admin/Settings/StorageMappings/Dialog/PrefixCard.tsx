import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { PrefixAutocomplete } from './PrefixAutocomplete';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import CardWrapper from 'src/components/shared/CardWrapper';

export function PrefixCard() {
    const { storageMappings } = useStorageMappings();

    const storageMappingPrefixes = useMemo(() => {
        return storageMappings.map((sm) => sm.catalogPrefix);
    }, [storageMappings]);

    const onBlurValidate = useMemo(
        () => ({
            notDuplicate: (value: string) =>
                !storageMappingPrefixes.includes(value) ||
                'A storage mapping already exists at this prefix. Click here to see it.',
        }),
        [storageMappingPrefixes]
    );

    return (
        <>
            <CardWrapper>
                <PrefixAutocomplete<StorageMappingFormData, 'catalog_prefix'>
                    name="catalog_prefix"
                    label="Estuary Prefix"
                    required
                    onBlurValidate={onBlurValidate}
                />
            </CardWrapper>
            {/* {JSON.stringify(storageMappings, null, 2)} */}
        </>
    );
}
