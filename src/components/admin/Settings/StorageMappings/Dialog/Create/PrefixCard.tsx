import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import {
    useBasePrefixes,
    useCouldMatchRoot,
    useLiveSpecs,
} from 'src/components/shared/LeavesAutocomplete';
import { RHFLeavesAutocomplete } from 'src/components/shared/RHFFields';
import { useDialogLink } from 'src/hooks/useDialog';
import { validateCatalogName } from 'src/validation';

export function PrefixCard() {
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const basePrefixes = useBasePrefixes();
    const { watch } = useFormContext<StorageMappingFormData>();
    const couldMatchRoot = useCouldMatchRoot(basePrefixes);

    const currentPrefix = watch('catalog_prefix');

    const duplicateDialogLinkParams = useDialogLink('EDIT_STORAGE_MAPPING', {
        prefix: currentPrefix,
    });

    const storageMappingPrefixes = useMemo(
        () => storageMappings.map((sm) => sm.catalogPrefix),
        [storageMappings]
    );

    // build list of leaves out of live specs and storage mappings
    const leaves = useMemo(
        () => [
            ...liveSpecNames.map((name) =>
                // remove the catalog name leaving just the containing prefix
                name.slice(0, name.lastIndexOf('/') + 1)
            ),
            ...storageMappingPrefixes,
        ],
        [liveSpecNames, storageMappingPrefixes]
    );

    const progressiveRules = useMemo(
        () => ({
            partial: {
                validate: {
                    validCharacters: (value: string) =>
                        validateCatalogName(value, false, true) == null ||
                        'Invalid prefix - only letters, numbers, dashes, underscores, and periods are allowed.',
                    couldMatchRoot,
                },
            },
            final: {
                required: 'Estuary prefix is required.',
                validate: {
                    notDuplicateMapping: (value: string) => {
                        return (
                            !storageMappingPrefixes.includes(value) ||
                            `A storage mapping already exists at this prefix. [Click here to see it.](${duplicateDialogLinkParams})`
                        );
                    },

                    noUncoveredSpecs: (value: string) => {
                        // A: child storage mappings under this prefix
                        const childStorageMappings =
                            storageMappingPrefixes.filter(
                                (prefix) =>
                                    prefix.startsWith(value) && prefix !== value
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
                },
            },
        }),
        [storageMappingPrefixes, liveSpecNames, duplicateDialogLinkParams, couldMatchRoot]
    );

    return (
        <RHFLeavesAutocomplete<StorageMappingFormData, 'catalog_prefix'>
            name="catalog_prefix"
            leaves={leaves}
            label="Estuary Prefix"
            required
            progressiveRules={progressiveRules}
        />
    );
}
