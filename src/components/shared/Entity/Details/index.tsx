import { useMemo } from 'react';
import useConstant from 'use-constant';

import { Box, Stack } from '@mui/material';

import { useUnmount } from 'react-use';

import { createEditorStore } from 'src/components/editor/Store/create';
import LiveSpecsHydrator from 'src/components/editor/Store/LiveSpecsHydrator';
import RenderTab from 'src/components/shared/Entity/Details/RenderTab';
import DetailTabs from 'src/components/shared/Entity/Details/Tabs';
import DetailsToolBar from 'src/components/shared/Entity/Details/ToolBar';
import ShardHydrator from 'src/components/shared/Entity/Shard/Hydrator';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'src/hooks/useBrowserTitle';
import EntityRelationshipsHydrator from 'src/stores/EntityRelationships/Hydrator';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';
import EntityStatusHydrator from 'src/stores/EntityStatus/Hydrator';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { EditorStoreNames } from 'src/stores/names';

// TODO: Hydrate the journal store in a single location that satisfies
//   the needs of components dependent on its state.
function EntityDetails() {
    useBrowserTitle('routeTitle.details');

    // Generate the local store
    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    const lastChecked = useConstant(() => Date.now().toString());

    // Fetch params from URL
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const resetEntityStatusState = useEntityStatusStore(
        (state) => state.resetState
    );

    const resetEntityRelationshipState = useEntityRelationshipStore(
        (state) => state.resetState
    );

    useUnmount(() => {
        resetEntityStatusState();
        resetEntityRelationshipState();
    });

    return (
        <LocalZustandProvider createStore={localStore}>
            <LiveSpecsHydrator catalogName={catalogName} localZustandScope>
                <ShardHydrator catalogName={catalogName}>
                    <EntityStatusHydrator catalogName={catalogName}>
                        <EntityRelationshipsHydrator
                            catalogName={catalogName}
                            lastChecked={lastChecked}
                        >
                            {/* No top margin: it sat on top of the container's
                                own padding, putting 34px between the page
                                header and the task name.

                                The tab panel is in this Stack rather than a
                                Box of its own so the gap under the tabs is the
                                same 16px as the one above them and as every
                                gutter on the page below. On its own it had an
                                8px margin that collapsed with the Stack's,
                                leaving the tabs sitting half a step too close
                                to the content they label.

                                It keeps a Box because two tabs render more
                                than one child, and as bare Stack children they
                                would pick up the 16px spacing between them.

                                No horizontal margin either: PageContainer's
                                padding is the page's left edge, and this used
                                to add 8px on top of it. The sum happened to
                                equal the page header's inset while the sidebar
                                was out, which is why the misalignment only ever
                                showed once it was collapsed. */}
                            <Stack spacing={2} sx={{ mb: 1 }}>
                                <DetailsToolBar />
                                <DetailTabs />

                                <Box>
                                    <RenderTab />
                                </Box>
                            </Stack>
                        </EntityRelationshipsHydrator>
                    </EntityStatusHydrator>
                </ShardHydrator>
            </LiveSpecsHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
