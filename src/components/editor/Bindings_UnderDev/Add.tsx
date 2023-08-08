import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material';
import AddCollection from 'components/transformation/create/Config/catalog/AddCollection';
import { useEntityType } from 'context/EntityContext';
import { defaultOutline, disabledButtonText } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';
import { Plus } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useStore } from 'zustand';
import PrimaryCTA from './PrimaryCTA';

interface Props {
    onChange: (value: string[]) => void;
    title: string;
    disabled?: boolean;
}

function BindingsEditorAdd({ disabled, onChange, title }: Props) {
    const theme = useTheme();
    const entityType = useEntityType();

    // For captures we want to show the bindings config as "Bindings"
    //  Other entities we still call them "collections" so we set to undefined
    //      as the default display is "collections"
    const itemType =
        entityType === 'capture' ? 'terms.bindings' : 'terms.collections';

    const resetSelected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) => {
        resetSelected();

        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    borderBottom: defaultOutline[theme.palette.mode],
                }}
            >
                <Typography
                    component="div"
                    sx={{
                        p: 1,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                    }}
                >
                    {title}
                </Typography>

                <IconButton
                    disabled={disabled}
                    onClick={toggleDialog}
                    sx={{ borderRadius: 0 }}
                >
                    <Plus
                        style={{
                            color: disabled
                                ? disabledButtonText[theme.palette.mode]
                                : theme.palette.primary.main,
                        }}
                    />
                </IconButton>
            </Stack>
            <AddCollection
                open={open}
                primaryCTA={
                    <PrimaryCTA
                        onChange={onChange}
                        setDialogOpen={toggleDialog}
                    />
                }
                toggle={toggleDialog}
                title={<FormattedMessage id={itemType} />}
            />
        </Box>
    );
}

export default BindingsEditorAdd;
