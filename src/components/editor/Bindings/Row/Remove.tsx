import { IconButton } from '@mui/material';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import { useEntityWorkflow } from 'context/Workflow';
import { Cancel } from 'iconoir-react';
import React from 'react';
import {
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeCollection,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';

interface Props {
    collection: string;
    disabled: boolean;
    draftId: string | null;
    task: string;
}

function BindingsSelectorRemove({
    collection,
    disabled,
    draftId,
    task,
}: Props) {
    const workflow = useEntityWorkflow();
    const discoveredCollections = useResourceConfig_discoveredCollections();
    const removeCollection = useResourceConfig_removeCollection();
    const setRestrictedDiscoveredCollections =
        useResourceConfig_setRestrictedDiscoveredCollections();

    const handlers = {
        removeCollection: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            removeCollection(collection);

            if (
                workflow === 'capture_edit' &&
                !hasLength(discoveredCollections)
            ) {
                const nativeCollectionDetected = collection.includes(task);

                nativeCollectionDetected
                    ? setRestrictedDiscoveredCollections(
                          collection,
                          nativeCollectionDetected
                      )
                    : setRestrictedDiscoveredCollections(collection);
            } else {
                setRestrictedDiscoveredCollections(collection);
            }

            if (draftId && !discoveredCollections?.includes(collection)) {
                void deleteDraftSpecsByCatalogName(draftId, 'collection', [
                    collection,
                ]);
            }
        },
    };

    return (
        <IconButton
            disabled={disabled}
            size="small"
            onClick={handlers.removeCollection}
            sx={{ color: (theme) => theme.palette.text.primary }}
        >
            <Cancel />
        </IconButton>
    );
}

export default BindingsSelectorRemove;
