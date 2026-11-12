import { Box, IconButton, Tooltip } from '@mui/material';

import { NavArrowRight } from 'iconoir-react';

import { EXPAND_ROW_TRANSITION } from 'src/components/tables/Logs/shared';

interface Props {
    expanded: boolean;
}

function ExpandRowButton({ expanded }: Props) {
    return (
        <Tooltip
            title={expanded ? 'show less' : 'show more'}
            placement="top"
            enterDelay={500}
        >
            <Box>
                <IconButton
                    aria-expanded={expanded}
                    sx={{
                        padding: 0.5,
                        marginRight: 0,
                        transform: `rotate(${expanded ? '90' : '0'}deg)`,
                        transition: `all ${EXPAND_ROW_TRANSITION}ms ease-in-out`,
                    }}
                >
                    <NavArrowRight />
                </IconButton>
            </Box>
        </Tooltip>
    );
}

export default ExpandRowButton;
