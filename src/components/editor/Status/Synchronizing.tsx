import { Typography } from '@mui/material';

import { DatabaseBackup } from 'iconoir-react';

interface Props {
    iconSize: number;
}

function Synchronizing({ iconSize }: Props) {
    return (
        <>
            <Typography>Synchronizing</Typography>

            <DatabaseBackup style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronizing;
