import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setCurrentCatalog,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useCallback, useEffect } from 'react';
import { DEFAULT_FILTER } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';

function useCatalogDetails(entityName: string | undefined) {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogName = currentCatalog?.catalog_name ?? null;
    const catalogSpec = currentCatalog?.spec ?? null;
    const catalogType = currentCatalog?.spec_type ?? null;

    const setCurrentCatalog = useEditorStore_setCurrentCatalog({
        localScope: true,
    });

    const setSpecs = useEditorStore_setSpecs({
        localScope: true,
    });
    const draftId = useEditorStore_persistedDraftId();

    const { draftSpecs, isValidating, mutate } = useDraftSpecs(draftId, {
        specType: 'collection',
        catalogName: entityName,
    });

    const onChange = useCallback(
        async (newVal: any, propUpdating: string) => {
            if (currentCatalog) {
                const updateResponse = await modifyDraftSpec(
                    {
                        ...currentCatalog.spec,
                        [propUpdating]: newVal,
                    },
                    {
                        draft_id: draftId,
                        catalog_name: catalogName ?? DEFAULT_FILTER,
                    }
                );

                if (updateResponse.error) {
                    return Promise.reject();
                }

                setCurrentCatalog(updateResponse.data[0]);
                return mutate();
            } else {
                return Promise.reject();
            }
        },
        [catalogName, currentCatalog, draftId, mutate, setCurrentCatalog]
    );

    useEffect(() => {
        if (hasLength(draftSpecs)) {
            setSpecs(draftSpecs);

            if (currentCatalog) {
                draftSpecs.some((val) => {
                    if (val.catalog_name !== entityName) {
                        return false;
                    }

                    setCurrentCatalog(val);
                    return true;
                });
            }
        }
        // This effect only cares about draftSpecs changing
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftSpecs, setSpecs, setCurrentCatalog]);

    return {
        onChange,
        isValidating,
        mutate,
        catalogName,
        catalogType,
        catalogSpec,
        currentCatalog,
    };
}

export default useCatalogDetails;
