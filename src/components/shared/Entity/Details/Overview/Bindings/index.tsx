import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import BindingsCard from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCard';
import { useEntityType } from 'src/context/EntityContext';
import useBindings from 'src/hooks/details/useBindings';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';
import { useShardDetail_readDictionary } from 'src/stores/ShardDetail/hooks';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
}

/**
 * The bindings of a capture or materialization, as a full-width section.
 *
 * These are the most-clicked thing on the page, and used to render as a chip
 * list inside a quarter-width rail with the remainder behind an "N more" toggle.
 *
 * The fetch lives here and the markup in `BindingsCard`, so Storybook can render
 * the same card from fixtures.
 */
function Bindings({ entityName, latestLiveSpec }: Props) {
    const entityType = useEntityType();

    // Read here as well as in useBindings so the heading can state the window
    // these figures cover without the table having to thread it back up.
    const range = useDetailsUsageStore((state) => state.range);

    const { bindings, error, statsLoading } = useBindings(
        entityName,
        entityType,
        latestLiveSpec
    );

    // The same signal the page's own header status pill is built from (see
    // `EntityStatus`), read here so the bindings table's Status column can
    // show a real failure instead of just a duller "enabled" — see StatusCell.
    const { shardsHaveErrors } = useShardDetail_readDictionary(entityName, [
        entityType,
    ]);

    return (
        <BindingsCard
            bindings={bindings}
            error={error}
            range={range}
            specLoading={!latestLiveSpec}
            taskHasError={shardsHaveErrors}
            volumesLoading={statsLoading}
        />
    );
}

export default Bindings;
