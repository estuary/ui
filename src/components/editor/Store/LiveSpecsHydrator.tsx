import type { LiveSpecsHydratorProps } from 'src/components/editor/Store/types';

import { useEffect } from 'react';

import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'src/components/editor/Store/hooks';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import { useLiveSpecs_details } from 'src/hooks/useLiveSpecs';
import EntityNotFound from 'src/pages/error/EntityNotFound';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasLength } from 'src/utils/misc-utils';

function LiveSpecsHydrator({
    localZustandScope,
    catalogName,
    children,
}: LiveSpecsHydratorProps) {
    const entityType = useEntityType();

    const { liveSpecs, isValidating, error } = useLiveSpecs_details(
        entityType,
        catalogName
    );

    const setSpecs = useEditorStore_setSpecs({ localScope: localZustandScope });
    const setId = useEditorStore_setId({ localScope: localZustandScope });

    const initializeProjections = useWorkflowStore(
        (state) => state.initializeProjections
    );

    useEffect(() => {
        const targetRow = liveSpecs[0];

        if (hasLength(liveSpecs)) {
            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: targetRow.last_pub_id,
                component: 'liveSpecHydrator',
            });

            if (entityType === 'collection' && liveSpecs.length === 1) {
                logRocketEvent(CustomEvents.PROJECTION, {
                    collection: targetRow.catalog_name,
                    operation: 'initialize',
                });
                logRocketConsole(`${CustomEvents.PROJECTION}:init:success`, {
                    liveSpecId: targetRow.id,
                    projectionsExist: Boolean(targetRow.spec?.projections),
                });

                initializeProjections(
                    targetRow.spec?.projections,
                    targetRow.catalog_name
                );
            }

            setSpecs(liveSpecs);
            setId(targetRow.last_pub_id);
        }
    }, [entityType, initializeProjections, liveSpecs, setId, setSpecs]);

    // TODO (details) make this error handling better
    // 1. Store this in the store
    // 2. Show the error but leave the proper header displaying
    if (error) {
        return <Error error={error} />;
    }

    // TODO (details) same as the error up above.
    // Targeting when a user does not have access to a spec
    // or there is a typo in the URL.
    if (!isValidating && !hasLength(liveSpecs)) {
        return <EntityNotFound catalogName={catalogName} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default LiveSpecsHydrator;
