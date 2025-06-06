import type { AutoDiscoverChangesProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Divider, Stack } from '@mui/material';

import NumberDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/NumberDetail';

export default function AutoDiscoverChanges({
    added,
    modified,
    removed,
}: AutoDiscoverChangesProps) {
    return (
        <Stack direction="row" spacing={1}>
            <NumberDetail
                headerMessageId="details.ops.status.overview.autoDiscovery.subheaderAdded"
                value={added?.length ?? 0}
            />

            <Divider flexItem orientation="vertical" />

            <NumberDetail
                headerMessageId="details.ops.status.overview.autoDiscovery.subheaderModified"
                value={modified?.length ?? 0}
            />

            <Divider flexItem orientation="vertical" />

            <NumberDetail
                headerMessageId="details.ops.status.overview.autoDiscovery.subheaderRemoved"
                value={removed?.length ?? 0}
            />
        </Stack>
    );
}
