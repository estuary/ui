import { Typography } from '@mui/material';

import EditOff from 'src/icons/EditOff';

interface Props {
    iconSize: number;
}

function ReadOnly({ iconSize }: Props) {
    return (
        <>
            <Typography>Read-Only</Typography>

            <EditOff style={{ fontSize: iconSize }} />
        </>
    );
}

export default ReadOnly;
