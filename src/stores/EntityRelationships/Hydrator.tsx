import type { HydratorProps } from 'src/stores/EntityRelationships/types';

import { useEffect } from 'react';

import { useMount, useUnmount } from 'react-use';

import { useEntityType } from 'src/context/EntityContext';
import { useEntityRelationships } from 'src/hooks/entityStatus/useEntityRelationships';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';

export default function EntityRelationshipsHydrator({
    catalogName,
    children,
}: HydratorProps) {
    const entityType = useEntityType();

    const { data, error } = useEntityRelationships(
        entityType === 'collection' ? catalogName : null
    );

    const [
        hydrated,
        resetState,
        setActive,
        setHydrated,
        setHydrationError,
        setCaptures,
        setMaterializations,
    ] = useEntityRelationshipStore((state) => [
        state.hydrated,
        state.resetState,
        state.setActive,
        state.setHydrated,
        state.setHydrationError,
        state.setCaptures,
        state.setMaterializations,
    ]);

    useMount(() => {
        if (!hydrated) {
            setActive(true);
        }
    });

    useUnmount(() => {
        resetState();
    });

    useEffect(() => {
        if (hydrated) {
            return;
        }

        if (error) {
            setCaptures(null);
            setMaterializations(null);

            setHydrationError(error);

            setHydrated(true);
            setActive(false);

            logRocketEvent(`${CustomEvents.ENTITY_RELATIONSHIPS}`, {
                init: 'failed',
            });

            return;
        }

        if (data) {
            const captures: any[] = [];
            const materializations: any[] = [];

            data.forEach((datum) => {
                if (datum.spec_type === 'capture') {
                    captures.push(datum.catalog_name);
                } else if (datum.spec_type === 'materialization') {
                    materializations.push(datum.catalog_name);
                }
            });

            setCaptures(captures);
            setMaterializations(materializations);

            setHydrationError(null);

            setHydrated(true);
            setActive(false);

            return;
        }
    }, [
        data,
        error,
        hydrated,
        setActive,
        setCaptures,
        setHydrated,
        setHydrationError,
        setMaterializations,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
