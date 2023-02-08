import { Typography } from '@mui/material';
import { DatabaseExport } from 'iconoir-react';
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

            <DatabaseExport style={{ fontSize: iconSize }} />
        </>
    );
}

export default Synchronizing;
