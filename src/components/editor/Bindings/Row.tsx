import { EntityWorkflow } from 'types';

import { Cancel } from 'iconoir-react';

import { IconButton, ListItemText } from '@mui/material';

import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';

import { typographyTruncation } from 'context/Theme';

import {
    useResourceConfig_discoveredCollections,
    useResourceConfig_removeCollection,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';

import { hasLength } from 'utils/misc-utils';

interface RowProps {
    collection: string;
    task: string;
    workflow: EntityWorkflow | null;
    disabled: boolean;
    draftId: string | null;
}

function ResourceConfigRow({
    collection,
    task,
    workflow,
    disabled,
    draftId,
}: RowProps) {
    // Resource Config Store
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
        <>
            <ListItemText
                primary={collection}
                primaryTypographyProps={typographyTruncation}
            />

            <IconButton
                disabled={disabled}
                size="small"
                onClick={handlers.removeCollection}
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <Cancel />
            </IconButton>
        </>
    );
}

export default ResourceConfigRow;
