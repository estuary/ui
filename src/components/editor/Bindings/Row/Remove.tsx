import type { BindingMetadata } from 'src/stores/Binding/types';

import React, { useState } from 'react';

import { IconButton } from '@mui/material';

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
import { hasLength } from 'src/utils/misc-utils';

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
        <IconButton
            disabled={removing || disabled}
            size="small"
            onClick={handlers.removeBinding}
            sx={{ color: (theme) => theme.palette.text.primary }}
        >
            <Xmark />
        </IconButton>
    );
}

export default BindingsSelectorRemove;
