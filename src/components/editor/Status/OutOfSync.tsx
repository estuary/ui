import { Typography } from '@mui/material';

import { DatabaseWarning } from 'iconoir-react';

interface Props {
    iconSize: number;
}

function OutOfSync({ iconSize }: Props) {
    return (
        <>
            <Typography>Out of Sync</Typography>

            <DatabaseWarning style={{ fontSize: iconSize }} />
        </>
    );
}

export default OutOfSync;
