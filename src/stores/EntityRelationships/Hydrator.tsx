import type { HydratorProps } from 'src/stores/EntityRelationships/types';

import { useEntityRelationships } from 'src/hooks/entityStatus/useEntityRelationships';

// TODO (entity status) - eventually we probably want to combine this
//  with EntityStatusHydrator so there is one call being made to the status
//  endpoint. However, we did not do this right away as we may want the
//  status to auto refresh and having it also fetch all the relationships
//  does not make as much sense.
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
