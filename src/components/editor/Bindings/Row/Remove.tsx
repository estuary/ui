import { IconButton } from '@mui/material';
import { deleteDraftSpecsByCatalogName } from 'api/draftSpecs';
import { useEntityWorkflow } from 'context/Workflow';
import { Cancel } from 'iconoir-react';
import React from 'react';
import {
    useBinding_discoveredCollections,
    useBinding_removeBinding,
    useBinding_setRestrictedDiscoveredCollections,
} from 'stores/Binding/hooks';
import { BindingMetadata } from 'stores/Binding/types';
import { hasLength } from 'utils/misc-utils';
import { useBindingsEditorStore_removeFullSourceConfig } from '../Store/hooks';

interface Props {
    binding: BindingMetadata;
    disabled: boolean;
    draftId: string | null;
    task: string;
}

function BindingsSelectorRemove({ binding, disabled, draftId, task }: Props) {
    const workflow = useEntityWorkflow();

    const removeBinding = useBinding_removeBinding();
    const discoveredCollections = useBinding_discoveredCollections();

    const setRestrictedDiscoveredCollections =
        useBinding_setRestrictedDiscoveredCollections();

    const removeFullSourceConfig =
        useBindingsEditorStore_removeFullSourceConfig();

    const handlers = {
        removeBinding: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const { collection } = binding;

            removeBinding(binding);
            removeFullSourceConfig(collection);

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

            if (draftId && !discoveredCollections.includes(collection)) {
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
            onClick={handlers.removeBinding}
            sx={{ color: (theme) => theme.palette.text.primary }}
        >
            <Cancel />
        </IconButton>
    );
}

export default BindingsSelectorRemove;
