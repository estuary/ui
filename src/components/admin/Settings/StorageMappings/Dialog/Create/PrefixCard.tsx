import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';

import { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { useLiveSpecs } from 'src/api/gql/liveSpecs';
import { useStorageMappings } from 'src/api/gql/storageMappings';
import { useCouldMatchRoot } from 'src/components/shared/LeavesAutocomplete';
import { RHFLeavesAutocomplete } from 'src/components/shared/RHFFields';
import { useDialogLink } from 'src/hooks/useDialog';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { validateCatalogName } from 'src/validation';

export function PrefixCard() {
    const intl = useIntl();
    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { watch } = useFormContext<StorageMappingFormData>();
    const couldMatchRoot = useCouldMatchRoot([selectedTenant]);

    const currentPrefix = watch('catalogPrefix');

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
                        intl.formatMessage({
                            id: 'storageMappings.dialog.prefix.validation.invalidCharacters',
                        }),
                    couldMatchRoot,
                },
            },
            final: {
                required: intl.formatMessage({
                    id: 'storageMappings.dialog.prefix.validation.required',
                }),
                validate: {
                    notDuplicateMapping: (value: string) => {
                        return (
                            !storageMappingPrefixes.includes(value) ||
                            intl.formatMessage(
                                {
                                    id: 'storageMappings.dialog.prefix.validation.duplicate',
                                },
                                { link: duplicateDialogLinkParams }
                            )
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
                            intl.formatMessage(
                                {
                                    id: 'storageMappings.dialog.prefix.validation.uncoveredSpecs',
                                },
                                { count: uncoveredSpecs.length }
                            )
                        );
                    },
                },
            },
        }),
        [
            storageMappingPrefixes,
            liveSpecNames,
            duplicateDialogLinkParams,
            couldMatchRoot,
            intl,
        ]
    );

    return (
        <RHFLeavesAutocomplete<StorageMappingFormData, 'catalogPrefix'>
            name="catalogPrefix"
            leaves={leaves}
            label={intl.formatMessage({
                id: 'storageMappings.dialog.prefix.label',
            })}
            required
            progressiveRules={progressiveRules}
        />
    );
}
