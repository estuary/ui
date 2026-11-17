import type { CaptureDef, MaterializationDef } from 'deps/flow/flow';
import type { EntityWithCreateWorkflow } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import {
    getDraftSpecsByCatalogName,
    getDraftSpecsByDraftId,
} from 'src/api/draftSpecs';

interface DraftSpec<S> {
    spec: S;
    expect_pub_id: string | null;
}

export type CaptureDraftSpec = DraftSpec<CaptureDef>;
export type MaterializationsDraftSpec = DraftSpec<MaterializationDef>;

export function useGetDraftSpec(
    catalogType: 'capture'
): ReturnType<typeof useGetCaptureDraftSpec>;
export function useGetDraftSpec(
    catalogType: 'materialization'
): ReturnType<typeof useGetMaterializationDraftSpec>;

export function useGetDraftSpec(catalogType: EntityWithCreateWorkflow) {
    const getCaptureDraftSpec = useGetCaptureDraftSpec();
    const getMaterializationDraftSpec = useGetMaterializationDraftSpec();

    switch (catalogType) {
        case 'capture':
            return getCaptureDraftSpec;
        case 'materialization':
            return getMaterializationDraftSpec;
    }
}

function useGetCaptureDraftSpec() {
    return useCallback(
        async (
            draftId: string,
            catalogName: string
        ): Promise<Result<CaptureDraftSpec | null>> => {
            // TODO: The `draft` graphql resolver does not make it easy to get a
            // single draft spec by catalogName. This means we would have to paginate
            // through all draft specs to find it, which is non-trivial for specs with
            // a large number of collections. So keep this as postgrest until the resolver
            // supports a lookup by catalogName.
            const { data, error } = await getDraftSpecsByCatalogName(
                draftId,
                catalogName,
                'capture'
            );
            if (error) {
                return { error: error as Error };
            }

            return data && data.length > 0
                ? { value: data[0] as CaptureDraftSpec }
                : { value: null };
        },
        []
    );
}

function useGetMaterializationDraftSpec() {
    return useCallback(
        async (
            draftId: string
        ): Promise<Result<MaterializationsDraftSpec | null>> => {
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
        },
        []
    );
}
