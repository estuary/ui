import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import { RHFPrefixAutocomplete, useLiveSpecs } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/PrefixAutocomplete';
import CardWrapper from 'src/components/shared/CardWrapper';

export function PrefixCard() {
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();

    const storageMappingPrefixes = useMemo(() => {
        return storageMappings.map((sm) => sm.catalogPrefix);
    }, [storageMappings]);

    const leaves = useMemo(
        () => [...liveSpecNames, ...storageMappingPrefixes],
        [liveSpecNames, storageMappingPrefixes]
    );

    const onBlurValidate = useMemo(
        () => ({
            notDuplicate: (value: string) =>
                !storageMappingPrefixes.includes(value) ||
                'A storage mapping already exists at this prefix. Click here to see it.',

            noUncoveredSpecs: (value: string) => {
                // A: child storage mappings under this prefix
                const childStorageMappings = storageMappingPrefixes.filter(
                    (prefix) => prefix.startsWith(value) && prefix !== value
                );

                // B: child live specs under this prefix
                const childLiveSpecs = liveSpecNames.filter((name) =>
                    name.startsWith(value)
                );

                // Fail if there are members of B not covered by any member of A
                const uncoveredSpecs = childLiveSpecs.filter(
                    (name) =>
                        !childStorageMappings.some((prefix) =>
                            name.startsWith(prefix)
                        )
                );

                return (
                    uncoveredSpecs.length === 0 ||
                    `${uncoveredSpecs.length} live spec(s) would be impacted by creating this storage mapping. Remove them or choose an empty prefix.`
                );
            },
        }),
        [storageMappingPrefixes, liveSpecNames]
    );

    return (
        <CardWrapper>
            <RHFPrefixAutocomplete<StorageMappingFormData, 'catalog_prefix'>
                name="catalog_prefix"
                leaves={leaves}
                label="Estuary Prefix"
                required
                onBlurValidate={onBlurValidate}
            />
        </CardWrapper>
    );
}
