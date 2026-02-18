import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import CardWrapper from 'src/components/shared/CardWrapper';
import {
    matchingRoot,
    useBasePrefixes,
    useLiveSpecs,
} from 'src/components/shared/PrefixAutocomplete';
import { RHFPrefixAutocomplete } from 'src/components/shared/RHFFields';
import { openDialogParams } from 'src/hooks/searchParams/useDialogParam';
import { validateCatalogName } from 'src/validation';

export function PrefixCard() {
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const basePrefixes = useBasePrefixes();
    const { watch } = useFormContext<StorageMappingFormData>();
    const [searchParams] = useSearchParams();

    const currentPrefix = watch('catalog_prefix');

    const storageMappingPrefixes = useMemo(() => {
        return storageMappings.map((sm) => sm.catalogPrefix);
    }, [storageMappings]);

    const leaves = useMemo(
        () => [
            ...liveSpecNames.map((name) =>
                name.slice(0, name.lastIndexOf('/') + 1)
            ),
            ...storageMappingPrefixes,
        ],
        [liveSpecNames, storageMappingPrefixes]
    );

    const onChangeValidate = useMemo(
        () => ({
            validCharacters: (value: string) =>
                validateCatalogName(value, false, true) == null ||
                'Invalid prefix - only letters, numbers, dashes, underscores, and periods are allowed.',
            isChildOfRoot: (value: string) => matchingRoot(value, basePrefixes),
        }),
        [basePrefixes]
    );

    const editLinkParams = useMemo(() => {
        const params = new URLSearchParams(searchParams);
        openDialogParams('edit-storage-mapping', {
            prefix: currentPrefix,
        })(params);
        return `?${params}`;
    }, [searchParams, currentPrefix]);

    const onBlurValidate = useMemo(
        () => ({
            notDuplicateMapping: (value: string) => {
                return (
                    !storageMappingPrefixes.includes(value) ||
                    `A storage mapping already exists at this prefix. [Click here to see it.](${editLinkParams})`
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
                    `${uncoveredSpecs.length} live spec(s) would be impacted by creating this storage mapping. Choose an empty prefix or contact support for help.`
                );
            },
        }),
        [storageMappingPrefixes, liveSpecNames, editLinkParams]
    );

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
        </CardWrapper>
    );
}
