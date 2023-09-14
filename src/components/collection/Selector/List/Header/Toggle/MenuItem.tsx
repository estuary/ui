import { Box, MenuItem, Stack, Typography } from '@mui/material';
import { Check } from 'iconoir-react';
import { ReactNode } from 'react';
import { Scopes } from './types';

interface Props {
    desc: ReactNode;
    scope: Scopes;
    scopeState: Scopes;
    onClick: () => void;
    title: ReactNode;
}

function HeaderToggleMenuItem({
    desc,
    onClick,
    scope,
    scopeState,
    title,
}: Props) {
    return (
        <MenuItem onClick={onClick}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ minWidth: 15, maxWidth: 15 }}>
                    <Typography>
                        {scopeState === scope ? <Check /> : null}
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                    <Typography
                        sx={{
                            textTransform: 'lowercase',
                        }}
                    >
                        {desc}
                    </Typography>
                </Box>
            </Stack>
        </MenuItem>
    );
}

export default HeaderToggleMenuItem;
