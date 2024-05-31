import { Box, FormControlLabel, Radio, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Scopes } from './types';

interface Props {
    desc: ReactNode;
    scope: Scopes;
    title: ReactNode;
}

function HeaderToggleMenuItem({ desc, scope, title }: Props) {
    return (
        <FormControlLabel
            value={scope}
            control={<Radio size="small" />}
            label={
                <Box style={{ padding: '8px 0px' }}>
                    <Typography
                        sx={{
                            mb: '4px',
                            fontWeight: 500,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            'textTransform': 'lowercase',
                            '&.MuiTypography-root:first-letter': {
                                textTransform: 'uppercase',
                            },
                        }}
                    >
                        {desc}
                    </Typography>
                </Box>
            }
            style={{ alignItems: 'flex-start' }}
        />
    );
}

export default HeaderToggleMenuItem;
