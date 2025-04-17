import type { BindingMetadata } from 'src/stores/Binding/types';

import React, { useState } from 'react';

import { Box, IconButton } from '@mui/material';

import { Xmark } from 'iconoir-react';

import { deleteDraftSpecsByCatalogName } from 'src/api/draftSpecs';
import { useEntityWorkflow } from 'src/context/Workflow';
import {
    useBinding_discoveredCollections,
    useBinding_removeBinding,
    useBinding_removeFullSourceConfig,
    useBinding_setRestrictedDiscoveredCollections,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    binding: BindingMetadata;
    draftId: string | null;
    task: string;
}

function BindingsSelectorRemove({ binding, draftId, task }: Props) {
    const [removing, setRemoving] = useState(false);

    const workflow = useEntityWorkflow();

    const formActive = useFormStateStore_isActive();

    const removeBinding = useBinding_removeBinding();
    const discoveredCollections = useBinding_discoveredCollections();
    const resetCollectionMetadata = useBindingStore(
        (state) => state.resetCollectionMetadata
    );

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

            // We need to reset this before actually fully removing so that the component is not unmounted
            setRemoving(false);

            removeBinding(binding);
            removeFullSourceConfig(uuid);

            if (workflow === 'materialization_edit') {
                resetCollectionMetadata([binding.collection], []);
            }

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
        },
    };

    return (
        // This has a box around is so the button doesn't get all stretched out in the table cell
        <Box>
            <IconButton
                disabled={removing || formActive}
                size="small"
                onClick={handlers.removeBinding}
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <Xmark />
            </IconButton>
        </Box>
    );
}

export default BindingsSelectorRemove;
