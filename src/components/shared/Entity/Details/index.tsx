import { useMemo } from 'react';
import useConstant from 'use-constant';

import { Box, Divider, Stack, Typography } from '@mui/material';

import { useUnmount } from 'react-use';

import { createEditorStore } from 'src/components/editor/Store/create';
import LiveSpecsHydrator from 'src/components/editor/Store/LiveSpecsHydrator';
import EditButton from 'src/components/shared/Entity/Details/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/MaterializeButton';
import RenderTab from 'src/components/shared/Entity/Details/RenderTab';
import DetailTabs from 'src/components/shared/Entity/Details/Tabs';
import ShardHydrator from 'src/components/shared/Entity/Shard/Hydrator';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import { truncateTextSx } from 'src/context/Theme';
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
                            <Stack spacing={2} sx={{ m: 1 }}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: 'space-between' }}
                                >
                                    <Typography
                                        component="span"
                                        variant="h6"
                                        sx={{
                                            ...truncateTextSx,
                                            alignItems: 'center',
                                        }}
                                    >
                                        {catalogName}
                                    </Typography>

                                    <Stack direction="row">
                                        <EditButton buttonVariant="outlined" />

                                        <MaterializeButton />
                                    </Stack>
                                </Stack>

                                <Divider />

                                <DetailTabs />
                            </Stack>

                            <Box sx={{ m: 1 }}>
                                <RenderTab />
                            </Box>
                        </EntityRelationshipsHydrator>
                    </EntityStatusHydrator>
                </ShardHydrator>
            </LiveSpecsHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
