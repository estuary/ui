import { Box, IconButton, Tooltip } from '@mui/material';

import { Xmark } from 'iconoir-react';

interface Props {
    itemType: string;
    onClick: (event: any) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderRemove({
    disabled,
    itemType,
    onClick,
}: Props) {
    return (
        <Tooltip title={`Remove ${itemType} in the list below`}>
            <Box>
                <IconButton
                    disabled={disabled}
                    onClick={onClick}
                    size="small"
                    sx={{
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    <Xmark />
                </IconButton>
            </Box>
        </Tooltip>
    );
}

export default CollectionSelectorHeaderRemove;
