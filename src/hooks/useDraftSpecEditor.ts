import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import useDraftSpecs, { DraftSpec } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import { Entity } from 'types';

function useDraftSpecEditor(
    entityName: string | undefined,
    entityType: Entity,
    useLocalScope: boolean
) {
    // Local State
    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: useLocalScope,
    });
    const setSpecs = useEditorStore_setSpecs({
        localScope: useLocalScope,
    });
    const draftId = useEditorStore_persistedDraftId();

    // Fetch the draft specs for this draft
    const { draftSpecs, isValidating, mutate } = useDraftSpecs(draftId, {
        specType: entityType,
        catalogName: entityName,
    });

    const handlers = {
        change: async (
            newVal: any,
            catalogName: string,
            propUpdating?: string
        ) => {
            if (draftSpec) {
                if (propUpdating) {
                    draftSpec.spec[propUpdating] = newVal;
                }

                const updateResponse = await modifyDraftSpec(draftSpec.spec, {
                    draft_id: draftId,
                    catalog_name: catalogName,
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

            if (currentCatalog) {
                draftSpecs.some((val) => {
                    if (val.catalog_name !== entityName) {
                        return false;
                    }

                    setDraftSpec(val);
                    return true;
                });
            }
        }
        // We do not care if currentCatalog changes that is handled below
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftSpecs, entityName, setSpecs]);

    useEffect(() => {
        if (currentCatalog) {
            setDraftSpec(currentCatalog);
        }
    }, [currentCatalog]);

    // TODO (sync editing) : turning off as right now this will show lots of "Out of sync" errors
    //    because we are comparing two JSON objects that are being stringified and that means the order
    //    change change whenever. We should probably compare the two objects and THEN if those do not match
    //    show an error/diff editor.
    //
    // useEffectOnce(() => {
    //     const publicationSubscription = supabaseClient
    //         .from(TABLES.DRAFT_SPECS)
    //         .on('*', async (payload: any) => {
    //             if (payload.new.spec) {
    //                 setServerUpdates(payload.new.spec);
    //             }
    //         })
    //         .subscribe();

    //     setSubscription(publicationSubscription);

    //     return () => {
    //         if (subscription) {
    //             void supabaseClient.removeSubscription(subscription);
    //         }
    //     };
    // });

    return {
        onChange: handlers.change,
        draftSpec,
        isValidating,
    };
}

export default useDraftSpecEditor;
