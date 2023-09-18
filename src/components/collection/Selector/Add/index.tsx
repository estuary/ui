import { IconButton, Tooltip, useTheme } from '@mui/material';
import AddDialog from 'components/shared/Entity/AddDialog';
import { useEntityType } from 'context/EntityContext';
import { disabledButtonText } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';
import { Plus } from 'iconoir-react';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { useStore } from 'zustand';

interface Props {
    selectedCollections: string[];
    AddSelectedButton: ReactNode;
    disabled?: boolean;
}

const STORE_NAME = SelectTableStoreNames.COLLECTION_SELECTOR;
const DIALOG_ID = 'add-collection-search-dialog';

function BindingsEditorAdd({
    AddSelectedButton,
    disabled,
    selectedCollections,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const entityType = useEntityType();

    const [open, setOpen] = useState<boolean>(false);

    const resetSelected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

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

    return (
        <>
            <Tooltip placement="top" title={tooltip}>
                <IconButton
                    disabled={disabled}
                    onClick={toggleDialog}
                    sx={{ borderRadius: 0 }}
                    aria-controls={open ? DIALOG_ID : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Plus
                        style={{
                            color: disabled
                                ? disabledButtonText[theme.palette.mode]
                                : theme.palette.primary.main,
                        }}
                    />
                </IconButton>
            </Tooltip>
            <AddDialog
                entity="collection"
                id={DIALOG_ID}
                open={open}
                primaryCTA={AddSelectedButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={itemType}
            />
        </>
    );
}

export default BindingsEditorAdd;
