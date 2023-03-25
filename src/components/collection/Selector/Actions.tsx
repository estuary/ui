import { Box, Button, Divider, Stack, useTheme } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    removeAllCollections: (event: React.MouseEvent<HTMLElement>) => void;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function CollectionSelectorActions({
    removeAllCollections,
    readOnly,
    RediscoverButton,
}: Props) {
    const theme = useTheme();

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
                    onClick={removeAllCollections}
                    sx={{ borderRadius: 0 }}
                >
                    <FormattedMessage id="workflows.collectionSelector.cta.delete" />
                </Button>
            </Stack>
        </Box>
    );
}

export default CollectionSelectorActions;
