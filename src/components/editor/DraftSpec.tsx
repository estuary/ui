import { modifyDraftSpec } from 'api/draftSpecs';
import MonacoEditor from 'components/editor/MonacoEditor';
import { MonacoEditorSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import {
    useEditorStore_currentCatalog,
    useEditorStore_persistedDraftId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import useDraftSpecs, { DraftSpec } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
import { Entity } from 'types';

export interface Props {
    entityType: Entity;
    disabled?: boolean;
    localZustandScope?: boolean;
    editorHeight?: number;
    entityName?: string;
}

function DraftSpecEditor({
    entityType,
    disabled,
    localZustandScope = false,
    editorHeight,
    entityName,
}: Props) {
    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    const setSpecs = useEditorStore_setSpecs({
        localScope: localZustandScope,
    });

    const draftId = useEditorStore_persistedDraftId();

    const { draftSpecs, isValidating, mutate } = useDraftSpecs(draftId, {
        specType: entityType,
        catalogName: entityName,
    });

    const [draftSpec, setDraftSpec] = useState<DraftSpec>(null);

    const handlers = {
        change: async (newVal: any, catalogName: string) => {
            if (draftSpec) {
                const updateResponse = await modifyDraftSpec(newVal, {
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
        }
    }, [setSpecs, draftSpecs]);

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
    } else if (isValidating) {
        return <MonacoEditorSkeleton editorHeight={editorHeight} />;
    } else {
        return null;
    }
}

export default DraftSpecEditor;
