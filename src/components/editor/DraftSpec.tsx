import { RealtimeSubscription } from '@supabase/supabase-js';
import EditorAndList from 'components/editor/EditorAndList';
import { EditorStoreState } from 'components/editor/Store';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { supabaseClient, TABLES } from 'services/supabase';

function DraftSpecEditor() {
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

    const setServerUpdates = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setServerUpdate']
    >((state) => state.setServerUpdate);

    const { draftSpecs, mutate } = useDraftSpecs(id);
    const [draftSpec, setDraftSpec] = useState<DraftSpecQuery | null>(null);
    const [subscription, setSubscription] =
        useState<RealtimeSubscription | null>(null);

    const handlers = {
        change: (newVal: any, catalogName: string) => {
            if (draftSpec) {
                const newData = {
                    spec: newVal,
                };

                const updatedPromise = supabaseClient
                    .from(TABLES.DRAFT_SPECS)
                    .update(newData)
                    .match({
                        draft_id: id,
                        catalog_name: catalogName,
                    })
                    .then(
                        () => {},
                        () => {}
                    );

                mutate()
                    .then(() => {})
                    .catch(() => {});

                return updatedPromise;
            }

            return Promise.reject();
        },
    };

    useEffect(() => {
        setSpecs(draftSpecs);
    }, [draftSpecs, setSpecs]);

    useEffect(() => {
        if (currentCatalog) {
            setDraftSpec(currentCatalog);
        }
    }, [currentCatalog]);

    useEffectOnce(() => {
        const publicationSubscription = supabaseClient
            .from(TABLES.DRAFT_SPECS)
            .on('*', async (payload: any) => {
                if (payload.new.spec) {
                    setServerUpdates(payload.new.spec);
                }
            })
            .subscribe();

        setSubscription(publicationSubscription);

        return () => {
            if (subscription) {
                void supabaseClient.removeSubscription(subscription);
            }
        };
    });

    if (draftSpec) {
        return (
            <EditorAndList
                value={draftSpec.spec}
                path={draftSpec.catalog_name}
                onChange={handlers.change}
            />
        );
    } else {
        return null;
    }
}

export default DraftSpecEditor;
