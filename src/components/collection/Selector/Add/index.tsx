import type { BindingsEditorAddProps } from 'src/components/collection/Selector/types';

import { useState } from 'react';

import { Button, Tooltip } from '@mui/material';

import { useStore } from 'zustand';

import { useIntl } from 'react-intl';

import DestinationLayoutDialog from 'src/components/materialization/targetNaming/Dialog';
import AddDialog from 'src/components/shared/Entity/AddDialog';
import { useEntityType } from 'src/context/EntityContext';
import invariableStores from 'src/context/Zustand/invariableStores';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';

const DIALOG_ID = 'add-collection-search-dialog';

function BindingsEditorAdd({
    AddSelectedButton,
    disabled,
    selectedCollections,
}: BindingsEditorAddProps) {
    const intl = useIntl();
    const entityType = useEntityType();

    const [open, setOpen] = useState<boolean>(false);

    const resetSelected = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

    const {
        strategy: targetNamingStrategy,
        needsNamingDialog,
        handleConfirm,
        namingDialogOpen,
        openNamingDialog,
        closeNamingDialog,
    } = useTargetNaming();

    // Captures can only disable/enable bindings in the UI. The user can
    //   actually remove items from the list via the CLI and we are okay
    //   with not handling that scenario in the UI as of Q3 2023
    // If we include this ensure to add this line below to the itemType handler
    //      id: entityType === 'capture' ? 'terms.bindings' : 'terms.collections'
    if (entityType === 'capture') {
        return null;
    }

    // For captures we want to show the bindings config as "Bindings"
    //  Other entities we still call them "collections" so we set to undefined
    //      as the default display is "collections"
    const itemType = intl.formatMessage({
        id: 'terms.collections',
    });

    const tooltip = intl.formatMessage(
        {
            id: 'entityCreate.bindingsConfig.addCTA',
        },
        {
            itemType,
        }
    );

    const toggleDialog = (args: any) => {
        resetSelected();
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    const handleAddClick = () => {
        if (needsNamingDialog) {
            openNamingDialog();
        } else {
            toggleDialog(true);
        }
    };

    return (
        <>
            <Tooltip placement="top" title={tooltip}>
                <Button
                    aria-controls={open ? DIALOG_ID : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    disabled={disabled}
                    onClick={handleAddClick}
                    sx={{ borderRadius: 0 }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.add' })}
                </Button>
            </Tooltip>

            {namingDialogOpen ? (
                <DestinationLayoutDialog
                    confirmIntlKey="destinationLayout.dialog.cta.addBindings"
                    open={namingDialogOpen}
                    initialStrategy={targetNamingStrategy}
                    onCancel={closeNamingDialog}
                    onConfirm={(strategy) =>
                        handleConfirm(strategy, () => toggleDialog(true))
                    }
                />
            ) : null}

            <AddDialog
                entity="collection"
                id={DIALOG_ID}
                open={open}
                PrimaryCTA={AddSelectedButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={itemType}
            />
        </>
    );
}

export default BindingsEditorAdd;
