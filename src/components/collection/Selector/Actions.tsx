import { Box, Button, Divider, Stack, useTheme } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import invariableStores from 'context/Zustand/invariableStores';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useStore } from 'zustand';

interface Props {
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function CollectionSelectorActions({ readOnly, RediscoverButton }: Props) {
    const theme = useTheme();

    const resetSelected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

    return (
        <Box
            sx={{
                ml: 'auto',
                borderTop: defaultOutline[theme.palette.mode],
                borderLeft: defaultOutline[theme.palette.mode],
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                divider={
                    RediscoverButton ? (
                        <Divider
                            orientation="vertical"
                            variant="middle"
                            flexItem
                        />
                    ) : null
                }
                sx={{
                    justifyContent: 'right',
                }}
            >
                {RediscoverButton ? RediscoverButton : null}

                <Button
                    variant="text"
                    disabled={readOnly}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        resetSelected();
                    }}
                    sx={{ borderRadius: 0 }}
                >
                    <FormattedMessage id="workflows.collectionSelector.cta.delete" />
                </Button>
            </Stack>
        </Box>
    );
}

export default CollectionSelectorActions;
