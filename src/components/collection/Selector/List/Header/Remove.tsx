import { Box, IconButton, Tooltip } from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

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
    const intl = useIntl();
    return (
        <Tooltip
            title={intl.formatMessage(
                {
                    id: 'entityCreate.bindingsConfig.list.removeAll',
                },
                {
                    itemType,
                }
            )}
        >
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
