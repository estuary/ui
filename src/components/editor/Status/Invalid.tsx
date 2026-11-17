import { Typography } from '@mui/material';

import { DatabaseWarning } from 'iconoir-react';

interface Props {
    iconSize: number;
}

function Invalid({ iconSize }: Props) {
    return (
        <>
            <Typography>Invalid</Typography>

            <DatabaseWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default Invalid;
