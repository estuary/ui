import { updateDraftSpec } from 'api/draftSpecs';
import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import {
    useEditorStore_currentCatalog,
    useEditorStore_id,
    useEditorStore_setSpecs,
} from 'components/editor/Store';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';

export interface Props {
    disabled?: boolean;
}

function DraftSpecEditor({ disabled }: Props) {
    const currentCatalog = useEditorStore_currentCatalog();

    const setSpecs = useEditorStore_setSpecs();

    const draftId = useEditorStore_id();

    const { draftSpecs, mutate } = useDraftSpecs(draftId);
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
        if (draftSpecs.length > 0) {
            setSpecs(draftSpecs);
        }
    }, [draftSpecs, setSpecs]);

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
            <EditorWithFileSelector
                disabled={disabled}
                localZustandScope={false}
                onChange={handlers.change}
            />
        );
    } else {
        return null;
    }
}

export default DraftSpecEditor;
