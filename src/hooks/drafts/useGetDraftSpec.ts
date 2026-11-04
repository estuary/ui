import type { EntityWithCreateWorkflow } from 'src/types';
import type {
    CaptureDraftSpec,
    MaterializationsDraftSpec,
} from 'src/types/schemaModels';

import { useCallback } from 'react';

import {
    getDraftSpecsByCatalogName,
    getDraftSpecsByDraftId,
} from 'src/api/draftSpecs';

// Overloads to help narrow the callback type during specific entity flows,
// otherwise fallsback the general callback for common/shared flows.
export function useGetDraftSpec(
    catalogType: 'capture'
): typeof getCaptureDraftSpec;
export function useGetDraftSpec(
    catalogType: 'materialization'
): typeof getMaterializationDraftSpec;
export function useGetDraftSpec(
    catalogType: 'capture' | 'materialization'
): typeof getMaterializationDraftSpec | typeof getCaptureDraftSpec;

export function useGetDraftSpec(catalogType: EntityWithCreateWorkflow) {
    return useCallback(
        async (draftId: string, catalogName?: string) => {
            return catalogType === 'capture'
                ? await getCaptureDraftSpec(draftId, catalogName)
                : await getMaterializationDraftSpec(draftId);
        },
        [catalogType]
    );
}

async function getCaptureDraftSpec(draftId: string, catalogName?: string) {
    if (!draftId) {
        return { value: null };
    }

    // Some flows don't have a catalogName (i.e. create workflow), so lookup by type
    // in those cases. Otherwise use the catalogName as it's more reliable for capture drafts.
    //
    // TODO: The `draft` graphql resolver does not make it easy to get a
    // single draft spec by catalogName. This means we would have to paginate
    // through all draft specs to find it, which is non-trivial for specs with
    // a large number of collections. So keep this as postgrest until the resolver
    // supports a lookup by catalogName.
    const { data, error } = catalogName
        ? await getDraftSpecsByCatalogName(draftId, catalogName, 'capture')
        : await getDraftSpecsByDraftId(draftId, 'capture');

    if (error) {
        return { error: error as Error };
    }

    return data && data.length > 0
        ? { value: data[0] as CaptureDraftSpec }
        : { value: null };
}

async function getMaterializationDraftSpec(draftId: string) {
    if (!draftId) {
        return { value: null };
    }

    // A materialization rename reuses the same draft. Nothing else in the draft
    // depends on its name (unlike captures), since its bindings point at collections
    // that already exist. So looking up by type finds the existing spec whatever it's
    // called, so it can be renamed in place. This works because the flow currently assumes
    // one materialization per draft.
    const { data, error } = await getDraftSpecsByDraftId(
        draftId,
        'materialization'
    );

    if (error) {
        return { error: error as Error };
    }

    return data && data.length > 0
        ? { value: data[0] as MaterializationsDraftSpec }
        : { value: null };
}
