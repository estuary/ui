import { Typography } from '@mui/material';
import { DatabaseBackup } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function Synchronizing({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.synchronizing" />
            </Typography>

            <DatabaseBackup style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronizing;
