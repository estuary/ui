import { Typography } from '@mui/material';

import { DatabaseCheck } from 'iconoir-react';

interface Props {
    iconSize: number;
}

function Synchronized({ iconSize }: Props) {
    return (
        <>
            <Typography>Synchronized</Typography>

            <DatabaseCheck style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronized;
