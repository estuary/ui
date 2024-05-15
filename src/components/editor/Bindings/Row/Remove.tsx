import { IconButton } from '@mui/material';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import { useEntityWorkflow } from 'context/Workflow';
import { Cancel } from 'iconoir-react';
import React, { useState } from 'react';
import {
    useBinding_discoveredCollections,
    useBinding_removeBinding,
    useBinding_removeFullSourceConfig,
    useBinding_setRestrictedDiscoveredCollections,
} from 'stores/Binding/hooks';
import { BindingMetadata } from 'stores/Binding/types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    binding: BindingMetadata;
    disabled: boolean;
    draftId: string | null;
    task: string;
}

function BindingsSelectorRemove({ binding, disabled, draftId, task }: Props) {
    const [removing, setRemoving] = useState(false);

    const workflow = useEntityWorkflow();

    const removeBinding = useBinding_removeBinding();
    const discoveredCollections = useBinding_discoveredCollections();

    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    const removeFullSourceConfig = useBinding_removeFullSourceConfig();

    const handlers = {
        removeBinding: async (event: React.MouseEvent<HTMLElement>) => {
            setRemoving(true);
            event.preventDefault();
            event.stopPropagation();

            const { collection, uuid } = binding;

            if (draftId && !discoveredCollections.includes(collection)) {
                const deleteResponse = await deleteDraftSpecsByCatalogName(
                    draftId,
                    'collection',
                    [collection]
                );

                if (deleteResponse.error) {
                    setRemoving(false);
                    return;
                }
            }

            removeBinding(binding);
            removeFullSourceConfig(uuid);

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

            setRemoving(false);
        },
    };

    return (
        <IconButton
            disabled={removing || disabled}
            size="small"
            onClick={handlers.removeBinding}
            sx={{ color: (theme) => theme.palette.text.primary }}
        >
            <Cancel />
        </IconButton>
    );
}

export default BindingsSelectorRemove;
