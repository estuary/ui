import type { HydratorProps } from 'src/stores/EntityRelationships/types';

import { useMount } from 'react-use';

import { useEntityType } from 'src/context/EntityContext';
import { useEntityRelationships } from 'src/hooks/entityStatus/useEntityRelationships';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';

export default function EntityRelationshipsHydrator({
    catalogName,
    children,
    lastChecked,
}: HydratorProps) {
    const entityType = useEntityType();

    const [hydrated, setActive] = useEntityRelationshipStore((state) => [
        state.hydrated,
        state.setActive,
    ]);

    // The hook is truly what hydrates the store.
    //  This wrapper just kicks off marking as active when not hydrated
    //  and blocking non collections from hydrating
    useEntityRelationships(
        entityType === 'collection' ? catalogName : null,
        lastChecked
    );

    useMount(() => {
        if (!hydrated) {
            setActive(true);
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
