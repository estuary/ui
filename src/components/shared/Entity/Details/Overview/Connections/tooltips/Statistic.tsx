import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    label: ReactNode;
    value: string;
}

function Statistic({ label, value }: Props) {
    return (
        <Box
            style={{
                alignItems: 'center',
                display: 'inline-flex',
                flexDirection: 'column',
            }}
        >
            <Typography
                style={{
                    fontWeight: 500,
                    paddingLeft: 4,
                    paddingRight: 4,
                }}
            >
                {value}
            </Typography>

            <Typography variant="caption">{label}</Typography>
        </Box>
    );
}

export default Statistic;
