import { Box } from '@mui/material';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor from 'components/editor/MonacoEditor';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useState } from 'react';
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

    const { draftSpecs, mutate } = useDraftSpecs(id);
    const [draftSpec, setDraftSpec] = useState<DraftSpecQuery | null>(null);

    const handlers = {
        change: (newVal: any) => {
            if (draftSpec) {
                const newData = {
                    ...draftSpec,
                    spec_patch: JSON.parse(newVal),
                };

                supabaseClient
                    .from(TABLES.DRAFT_SPECS)
                    .update(newData)
                    .match({
                        draft_id: id,
                        catalog_name: draftSpec.catalog_name,
                    })
                    .then(
                        () => {},
                        () => {}
                    );

                mutate()
                    .then(() => {})
                    .catch(() => {});
            }
        },
    };

    useEffect(() => {
        setSpecs(draftSpecs);
    }, [draftSpecs, setSpecs]);

    useEffect(() => {
        setDraftSpec(
            draftSpecs[currentCatalog] ? draftSpecs[currentCatalog] : null
        );
    }, [currentCatalog, draftSpecs, setSpecs]);

    if (draftSpec) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    height: 300,
                }}
            >
                <EditorFileSelector />
                <MonacoEditor
                    value={draftSpec.spec_patch}
                    path={draftSpec.catalog_name}
                    onChange={handlers.change}
                />
            </Box>
        );
    } else {
        return null;
    }
}

export default DraftSpecEditor;
