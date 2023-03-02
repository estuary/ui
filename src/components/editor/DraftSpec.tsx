import { updateDraftSpec } from 'api/draftSpecs';
import MonacoEditor from 'components/editor/MonacoEditor';
import {
    useEditorStore_currentCatalog,
    useEditorStore_id,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import {
    useResourceConfig_collections,
    useResourceConfig_currentCollection,
} from 'stores/ResourceConfig/hooks';

export interface Props {
    disabled?: boolean;
    localZustandScope?: boolean;
    editorHeight?: number;
}

function DraftSpecEditor({
    disabled,
    localZustandScope = false,
    editorHeight,
}: Props) {
    const entityType = useEntityType();

    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    const setSpecs = useEditorStore_setSpecs({
        localScope: localZustandScope,
    });

    const draftId = useEditorStore_id();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();
    const collections = useResourceConfig_collections();

    const { draftSpecs, mutate } = useDraftSpecs(
        draftId,
        null,
        localZustandScope ? 'collection' : entityType
    );
    const [draftSpec, setDraftSpec] = useState<DraftSpecQuery | null>(null);

    const handlers = {
        change: async (newVal: any, catalogName: string) => {
            if (draftSpec) {
                const updateResponse = await updateDraftSpec(
                    draftId,
                    catalogName,
                    newVal
                );

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
        if (!localZustandScope && draftSpecs.length > 0) {
            setSpecs(draftSpecs);
        } else if (localZustandScope && draftSpecs.length > 0) {
            const currentCollectionSpec = draftSpecs.filter(
                (query) => query.catalog_name === currentCollection
            );

            if (currentCollectionSpec.length > 0) {
                setSpecs(currentCollectionSpec);
            }
        }
    }, [setSpecs, collections, currentCollection, draftSpecs, entityType]);

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

    if (draftSpec) {
        return (
            <MonacoEditor
                disabled={disabled}
                localZustandScope={localZustandScope}
                height={editorHeight}
                onChange={handlers.change}
            />
        );
    } else {
        return null;
    }
}

export default DraftSpecEditor;
