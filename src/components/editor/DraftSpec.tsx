import { updateDraftSpec } from 'api/draftSpecs';
import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { EditorStoreState } from 'components/editor/Store';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';

export interface Props {
    disabled?: boolean;
}

function DraftSpecEditor({ disabled }: Props) {
    const currentCatalog = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    const setSpecs = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const id = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const { draftSpecs } = useDraftSpecs(id);
    const [draftSpec, setDraftSpec] = useState<DraftSpecQuery | null>(null);

    const handlers = {
        change: (newVal: any, catalogName: string) => {
            if (draftSpec) {
                return updateDraftSpec(id, catalogName, newVal);
            }

            return Promise.reject();
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
    //    because we are comparing two JSON obejcts that are being stringified and that means the order
    //    change change whenever. We should probably compare the two obejcts and THEN if those do not match
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
                value={draftSpec.spec}
                path={draftSpec.catalog_name}
                onChange={handlers.change}
                disabled={disabled}
            />
        );
    } else {
        return null;
    }
}

export default DraftSpecEditor;
