import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import useDraftSpecs, { DraftSpec } from 'hooks/useDraftSpecs';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_FILTER } from 'services/supabase';

function useCatalogDetails(entityName: string | undefined) {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogName = currentCatalog?.catalog_name ?? null;
    const catalogSpec = currentCatalog?.spec ?? null;
    const catalogType = currentCatalog?.spec_type ?? null;

    const setSpecs = useEditorStore_setSpecs({
        localScope: true,
    });
    const draftId = useEditorStore_persistedDraftId();

    const { draftSpecs, isValidating, mutate } = useDraftSpecs(draftId, {
        specType: 'collection',
        catalogName: entityName,
    });
    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    const handlers = {
        change: async (newVal: any) => {
            if (draftSpec) {
                const updateResponse = await modifyDraftSpec(newVal, {
                    draft_id: draftId,
                    catalog_name: catalogName ?? DEFAULT_FILTER,
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutate();
            } else {
                return Promise.reject();
            }
        },
    };

    useEffect(() => {
        if (draftSpecs.length > 0) {
            setSpecs(draftSpecs);
        }
    }, [setSpecs, draftSpecs]);

    useEffect(() => {
        if (currentCatalog) {
            setDraftSpec(currentCatalog);
        }
    }, [currentCatalog]);

    return useMemo(() => {
        return {
            onChange: handlers.change,
            draftSpec,
            isValidating,
            mutate,
            catalogName,
            catalogType,
            catalogSpec,
        };
    }, [
        catalogName,
        catalogSpec,
        catalogType,
        draftSpec,
        handlers.change,
        isValidating,
        mutate,
    ]);
}

export default useCatalogDetails;
