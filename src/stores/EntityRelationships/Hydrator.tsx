import type { HydratorProps } from 'src/stores/EntityRelationships/types';

import { useEntityRelationships } from 'src/hooks/entityStatus/useEntityRelationships';

export default function EntityRelationshipsHydrator({
    catalogName,
    children,
    lastChecked,
}: HydratorProps) {
    // The hook is truly what hydrates the store.
    //  This wrapper just kicks off marking as active when not hydrated
    //  and blocking non collections from hydrating
    useEntityRelationships(catalogName, lastChecked);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
