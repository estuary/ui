import type { BindingsEditorAddProps } from 'src/components/collection/Selector/types';

import { useState } from 'react';

import { Button, Tooltip } from '@mui/material';

import { useStore } from 'zustand';

import AddDialog from 'src/components/shared/Entity/AddDialog';
import { useEntityType } from 'src/context/EntityContext';
import invariableStores from 'src/context/Zustand/invariableStores';

const DIALOG_ID = 'add-collection-search-dialog';
const ITEM_TYPE = 'Collections';
const TOOLTIP = `Add ${ITEM_TYPE}`;

function BindingsEditorAdd({
    AddSelectedButton,
    disabled,
    selectedCollections,
}: BindingsEditorAddProps) {
    const entityType = useEntityType();
    const [open, setOpen] = useState<boolean>(false);

    const resetSelected = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

    // Captures can only disable/enable bindings in the UI. The user can
    //   actually remove items from the list via the CLI and we are okay
    //   with not handling that scenario in the UI as of Q3 2023
    if (entityType === 'capture') {
        return null;
    }

    const toggleDialog = (args: any) => {
        resetSelected();
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <>
            <Tooltip placement="top" title={TOOLTIP}>
                <Button
                    aria-controls={open ? DIALOG_ID : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    disabled={disabled}
                    onClick={() => toggleDialog(true)}
                    sx={{ borderRadius: 0 }}
                    variant="text"
                >
                    Add
                </Button>
            </Tooltip>

            <AddDialog
                entity="collection"
                id={DIALOG_ID}
                open={open}
                PrimaryCTA={AddSelectedButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={ITEM_TYPE}
            />
        </>
    );
}

export default BindingsEditorAdd;
