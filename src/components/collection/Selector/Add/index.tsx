import { IconButton, Tooltip, useTheme } from '@mui/material';
import { SelectedCollectionChangeData } from 'components/editor/Bindings/types';
import { useEntityType } from 'context/EntityContext';
import { disabledButtonText } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';
import { Plus } from 'iconoir-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useStore } from 'zustand';
import AddCollectionDialog from './Dialog';
import PrimaryCTA from './PrimaryCTA';

interface Props {
    onChange: (value: SelectedCollectionChangeData[]) => void;
    disabled?: boolean;
}

const DIALOG_ID = 'add-collection-search-dialog';

function BindingsEditorAdd({ disabled, onChange }: Props) {
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
            <AddCollectionDialog
                id={DIALOG_ID}
                open={open}
                primaryCTA={
                    <PrimaryCTA
                        onChange={onChange}
                        setDialogOpen={toggleDialog}
                    />
                }
                toggle={toggleDialog}
                title={itemType}
            />
        </>
    );
}

export default BindingsEditorAdd;
