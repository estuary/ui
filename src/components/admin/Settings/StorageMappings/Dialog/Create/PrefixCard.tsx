import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import {
    isChildOfRoot,
    RHFPrefixAutocomplete,
    useBasePrefixes,
    useLiveSpecs,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/PrefixAutocomplete';
import CardWrapper from 'src/components/shared/CardWrapper';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { validateCatalogName } from 'src/validation';

export function PrefixCard() {
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const basePrefixes = useBasePrefixes();
    const { watch } = useFormContext<StorageMappingFormData>();
    const [, setSearchParams] = useSearchParams();

    const currentPrefix = watch('catalog_prefix');

    const storageMappingPrefixes = useMemo(() => {
        return storageMappings.map((sm) => sm.catalogPrefix);
    }, [storageMappings]);

    const leaves = useMemo(
        () => [...liveSpecNames, ...storageMappingPrefixes],
        [liveSpecNames, storageMappingPrefixes]
    );

    const onChangeValidate = useMemo(
        () => ({
            validCharacters: (value: string) =>
                validateCatalogName(value, false, true) == null ||
                'Invalid prefix - only letters, numbers, dashes, underscores, and periods are allowed.',
            isChildOfRoot: (value: string) =>
                isChildOfRoot(value, basePrefixes),
        }),
        [basePrefixes]
    );

    const onBlurValidate = useMemo(
        () => ({
            notDuplicateMapping: (value: string) => {
                console.log('Validating duplicate mapping for value:', value);
                return (
                    !storageMappingPrefixes.includes(value) ||
                    'A storage mapping already exists at this prefix. Click here to see it.'
                );
            },

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

    const isDuplicate = storageMappingPrefixes.includes(currentPrefix);

    return (
        <CardWrapper>
            <RHFPrefixAutocomplete<StorageMappingFormData, 'catalog_prefix'>
                name="catalog_prefix"
                leaves={leaves}
                label="Estuary Prefix"
                required
                onBlurValidate={onBlurValidate}
                onChangeValidate={onChangeValidate}
            />
            {isDuplicate ? (
                <Button
                    onClick={() => {
                        setSearchParams((prev) => {
                            prev.set(
                                GlobalSearchParams.SM_DIALOG,
                                'edit'
                            );
                            prev.set(
                                GlobalSearchParams.SM_PREFIX,
                                currentPrefix
                            );
                            return prev;
                        });
                    }}
                >
                    Go to existing storage mapping
                </Button>
            ) : null}
        </CardWrapper>
    );
}
